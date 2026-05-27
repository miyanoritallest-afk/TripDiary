---
name: start-servers
description: Start the development servers for TripDiary (PostgreSQL via Docker + Next.js dev server). Checks for port conflicts first and verifies startup before reporting.
---

# start-servers

TripDiary の開発サーバー（PostgreSQL + Next.js）を正しい順序で起動する。

## 固定ポート設定

| サービス   | ポート | 設定ファイル |
|-----------|--------|-------------|
| PostgreSQL | 5432   | docker-compose.yml |
| Next.js    | 3000   | Next.js デフォルト |

**別ポートでの起動は禁止。** Prisma の DATABASE_URL と Next.js の設定がこれらのポートに依存している。

## 実行ステップ

### 1. ポートの空きを確認・解放

各ポート（5432, 3000）について：
```powershell
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 5432, 3000 }
```

使用中のポートがあれば PID を特定して終了：
```powershell
Stop-Process -Id <PID> -Force
```

### 2. Docker Desktop の起動確認

```bash
docker info
```

起動していない場合は Docker Desktop を起動：
```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```
`docker info` が成功するまで10秒おきに確認（最大2分）。

### 3. PostgreSQL を起動（ポート 5432）

```bash
docker compose up -d postgres
```

healthy になるまで確認：
```bash
docker compose ps postgres
```

### 4. Next.js 開発サーバーを起動（ポート 3000）

```bash
npm run dev
```

起動確認（最大30秒ポーリング）：
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```
期待値: `200`

### 5. 全サービスの確認レポート

```
## サービス起動状況

| サービス   | ポート | 状態 |
|-----------|--------|------|
| PostgreSQL | 5432   | ✅ healthy |
| Next.js    | 3000   | ✅ 起動済み |
```

全サービスが起動したら `http://localhost:3000` をブラウザで開く：
```powershell
Start-Process "http://localhost:3000"
```

## ポート競合の解消

不明なプロセスがポートを占有している場合：
1. 特定: `Get-NetTCPConnection -LocalPort <PORT> -State Listen`
2. 終了: `Stop-Process -Id <PID> -Force`
3. ポートが空いたことを確認してからサービスを起動

**代替ポートでの起動は絶対にしないこと。**
