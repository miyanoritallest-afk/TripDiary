#!/bin/bash
set -euo pipefail
exec > /var/log/user_data.log 2>&1

# ── 1. システムパッケージ ──────────────────────────────────────────────
dnf install -y git

# Node.js 20.x LTS（NodeSource）
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

# PM2（プロセスマネージャー）
npm install -g pm2

# ── 2. EC2 メタデータ取得 ───────────────────────────────────────────────
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# ── 3. 環境変数ファイルを生成 ───────────────────────────────────────────
cat > /home/ec2-user/.env.production << 'ENVEOF'
DATABASE_URL="postgresql://${db_username}:${db_password}@${db_host}:5432/${db_name}"
NEXTAUTH_SECRET="${nextauth_secret}"
NEXTAUTH_URL="http://PUBLIC_IP_PLACEHOLDER:3000"
ANTHROPIC_API_KEY="${anthropic_api_key}"
STORAGE_PROVIDER=s3
AWS_REGION="${aws_region}"
AWS_S3_BUCKET_NAME="${s3_bucket}"
NODE_ENV=production
ENVEOF

# NEXTAUTH_URL の PUBLIC_IP_PLACEHOLDER を実際の IP に置換
sed -i "s/PUBLIC_IP_PLACEHOLDER/$PUBLIC_IP/" /home/ec2-user/.env.production

chown ec2-user:ec2-user /home/ec2-user/.env.production
chmod 600 /home/ec2-user/.env.production

# ── 4. アプリケーションをクローン ──────────────────────────────────────
APP_DIR="/home/ec2-user/app"
git clone "${github_repo_url}" "$APP_DIR"
chown -R ec2-user:ec2-user "$APP_DIR"

# ── 5. 依存パッケージインストール ──────────────────────────────────────
cd "$APP_DIR"
sudo -u ec2-user npm ci --omit=dev

# ── 6. .env.production をアプリディレクトリにコピー ────────────────────
sudo -u ec2-user cp /home/ec2-user/.env.production "$APP_DIR/.env.production"

# ── 7. Prisma マイグレーション（本番用） ────────────────────────────────
# RDS が起動完了するまで最大 3 分リトライ
for i in $(seq 1 18); do
  sudo -u ec2-user npx prisma migrate deploy --schema="$APP_DIR/prisma/schema.prisma" && break
  echo "DB not ready yet, retrying in 10s ($i/18)..."
  sleep 10
done

# ── 7b. 初回シードデータ投入（upsert で冪等） ───────────────────────────
cd "$APP_DIR"
sudo -u ec2-user npx prisma db seed

# ── 8. Next.js ビルド ───────────────────────────────────────────────────
sudo -u ec2-user npm run build

# ── 9. PM2 で起動・OS 再起動時に自動起動 ──────────────────────────────
sudo -u ec2-user pm2 start npm --name "navilog" -- start
sudo -u ec2-user pm2 save

# PM2 を systemd に登録（root で実行して ec2-user スタートアップを設定）
env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user

echo "=== user_data complete: Navilog is running on port 3000 ==="
