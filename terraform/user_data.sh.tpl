#!/bin/bash
set -e

# Docker をインストール
dnf install -y docker git
systemctl enable --now docker
usermod -aG docker ec2-user

# Docker Compose v2 プラグインをインストール
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL \
  "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# EC2 のパブリック IP を取得（NEXTAUTH_URL に使用）
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# アプリ用の環境変数ファイルを生成
# このファイルは docker run --env-file で読み込む
cat > /home/ec2-user/.env.production << ENVEOF
DATABASE_URL="postgresql://${db_username}:${db_password}@${db_host}:5432/${db_name}"
NEXTAUTH_SECRET="${nextauth_secret}"
NEXTAUTH_URL="http://$PUBLIC_IP:3000"
ANTHROPIC_API_KEY="${anthropic_api_key}"
STORAGE_PROVIDER=s3
AWS_REGION="${aws_region}"
AWS_S3_BUCKET_NAME="${s3_bucket}"
NODE_ENV=production
ENVEOF

chown ec2-user:ec2-user /home/ec2-user/.env.production
chmod 600 /home/ec2-user/.env.production
