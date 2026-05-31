# Navilog

旅行体験を写真・地図ピンとともに共有できるSNS風アプリ。他ユーザーの投稿に「行きたい！」を押すと、AIキャラクター**ナビちゃん（🦜）**との会話スレッドが自動生成され、旅行プランを気軽に相談できます。

## 主な機能

- **タイムライン** — 全ユーザーの旅行投稿を閲覧（全体 / フォロー中の切り替え）
- **投稿** — 写真最大6枚・本文・ハッシュタグ・地図ピン付きで旅行を投稿（モーダル形式）
- **投稿カード** — 写真スワイプ・地名バッジ・地図の開閉表示
- **いいね / 行きたい！** — 投稿へのリアクション
- **フォロー** — ユーザーをフォロー・フォロー中投稿のみ表示
- **ナビちゃん** — Claude API搭載のAI旅行プランナー（「行きたい！」からスレッド自動生成・ユーザーの好み記憶・ストリーミング応答）
- **プロフィール** — アバター・自己紹介・投稿グリッド・フォロー数表示・インライン編集

## スクリーンショット

| ログイン | 新規登録 |
|:---:|:---:|
| ![ログイン画面](screenshots/提出資料/スクリーンショット/ログイン画面.png) | ![新規登録画面](screenshots/提出資料/スクリーンショット/新規登録画面.png) |

| タイムライン（全体） | タイムライン（フォロー中） |
|:---:|:---:|
| ![タイムライン](screenshots/提出資料/スクリーンショット/タイムライン.png) | ![フォロー中タイムライン](screenshots/提出資料/スクリーンショット/フォロー中タイムライン.png) |

| ナビちゃん一覧 | ナビちゃんスレッド（京都旅行） |
|:---:|:---:|
| ![ナビちゃん画面](screenshots/提出資料/スクリーンショット/ナビちゃん画面.png) | ![ナビちゃんスレッド_京都旅行](screenshots/提出資料/スクリーンショット/ナビちゃんスレッド_京都旅行.png) |

| プロフィール |  |
|:---:|:---:|
| ![プロフィール画面](screenshots/提出資料/スクリーンショット/プロフィール画面.png) | |

## デモ動画

| 動画 | 内容 |
|------|------|
| [▶ ナビちゃん会話デモ](screenshots/提出資料/デモ動画/ナビちゃん会話デモ.mp4) | ナビちゃんと旅行プランを相談する様子 |
| [▶ 「行きたい！」からスレッド自動生成](screenshots/提出資料/デモ動画/ナビちゃんスレッド_行きたいボタン.mp4) | 投稿に「行きたい！」を押すとナビちゃんスレッドが自動生成される |
| [▶ ナビちゃんスレッド（相談ボタン）](screenshots/提出資料/デモ動画/ナビちゃんスレッド_相談ボタン.mp4) | スレッドから旅行プランを相談する |
| [▶ 画像投稿デモ](screenshots/提出資料/デモ動画/画像投稿デモ.mp4) | 写真・地図ピン付きで旅行を投稿する |

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| 言語 | TypeScript 5.x |
| フレームワーク | Next.js 14（App Router） |
| スタイリング | Tailwind CSS 3.x |
| アニメーション | Framer Motion 12.x |
| 認証 | NextAuth.js 4.x（メール＋パスワード / JWT） |
| ORM | Prisma 5.x |
| データベース | PostgreSQL（開発: Docker / 本番: AWS RDS） |
| ストレージ | ローカルファイル（開発） / AWS S3（本番） |
| 地図 | Leaflet.js + React Leaflet + OpenStreetMap |
| ジオコーディング | Nominatim（OpenStreetMap） |
| AI | Claude API（開発: claude-haiku-4-5 / 本番: claude-sonnet-4-6） |
| ホスティング | AWS EC2（Terraform で構成済み） |

<details>
<summary>開発環境構築・品質チェック</summary>

## 環境構築（開発）

### 必要なソフトウェア

- [Node.js 20.x LTS](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 手順

**1. リポジトリをクローン**

```bash
git clone <repository-url>
cd TripDiary
```

**2. 依存パッケージをインストール**

```bash
npm install
```

**3. 環境変数を設定**

`.env.local` をプロジェクトルートに作成し、以下を記入してください。

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/tripdiary"

# NextAuth
NEXTAUTH_SECRET="<openssl rand -base64 32 で生成>"
NEXTAUTH_URL="http://localhost:3000"

# Anthropic Claude API
ANTHROPIC_API_KEY="sk-ant-..."

# Storage: "local"（開発）または "s3"（本番）
STORAGE_PROVIDER=local
```

**4. PostgreSQL を Docker で起動**

```bash
docker compose up -d
```

**5. DBマイグレーションを実行**

```bash
npx prisma migrate dev --name init
```

**6. 開発サーバーを起動**

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開いてください。

### DBの中身を確認する（Prisma Studio）

```bash
npx prisma studio
```

[http://localhost:5555](http://localhost:5555) でテーブルの中身をGUI確認できます。

## 品質チェック

```bash
npm run typecheck   # TypeScript型チェック
npm run lint        # ESLint
npm run test        # Vitest（ユニットテスト）
npm run check       # 上記3つを一括実行
```

</details>

## プロジェクト構成

```
src/
├── app/
│   ├── api/                  # バックエンド（APIエンドポイント）
│   │   ├── auth/             # 認証（NextAuth / 会員登録）
│   │   ├── posts/            # 投稿CRUD・いいね・行きたい！
│   │   ├── follows/          # フォロー
│   │   ├── profiles/         # プロフィール
│   │   ├── navi/             # ナビちゃん（Claude API・スレッド・メッセージ）
│   │   ├── photos/           # 写真アップロード
│   │   └── geocoding/        # ジオコーディング（Nominatim）
│   ├── login/                # ログイン画面
│   ├── register/             # 会員登録画面
│   ├── timeline/             # タイムライン画面
│   ├── following/            # フォロー中タイムライン
│   ├── profile/              # 自分のプロフィール画面
│   ├── navi/                 # ナビちゃんスレッド一覧・チャット画面
│   └── user/[userId]/        # 他ユーザーの投稿一覧
├── components/
│   ├── layout/               # BottomTab・SessionProvider
│   ├── post/                 # PostCard・PhotoSwiper・PostCreateModal 等
│   └── map/                  # PostMap（Leaflet）
├── contexts/                 # NaviThreadContext（ストリーミング状態管理）
├── lib/
│   ├── db.ts                 # PrismaClient
│   ├── auth.ts               # NextAuth設定
│   ├── claude.ts             # Anthropic SDK・システムプロンプト
│   ├── storage.ts            # ファイルアップロード（ローカル / S3切り替え）
│   └── mappers.ts            # DB→レスポンス型変換
└── types/                    # 型定義（Post・User・NaviThread 等）
prisma/
└── schema.prisma             # DBスキーマ（全10テーブル）
terraform/                    # AWSインフラ構成（EC2・RDS・S3・VPC・IAM）
docker-compose.yml            # PostgreSQL開発環境
screenshots/                  # 動作確認スクリーンショット
docs/                         # 設計ドキュメント
```

## ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [使い方ガイド](docs/guide.md) | 初めての方向けの操作説明書 |
| [要件定義書](docs/requirements.md) | システム概要・機能スコープ |
| [機能一覧・機能定義書](docs/features.md) | 機能一覧・ユースケース詳細 |
| [画面設計書](docs/screens.md) | 画面一覧・ワイヤーフレーム・画面遷移図 |
| [データモデル・ER図](docs/data-model.md) | テーブル定義・エンティティ関係図 |
| [技術スタック](docs/tech-stack.md) | 使用技術・バージョン・採用理由 |
| [インフラ構成](docs/infrastructure.md) | AWS構成・Terraform |
| [非機能要件](docs/non-functional.md) | パフォーマンス・セキュリティ・対応環境 |
