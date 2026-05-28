# TripDiary

旅行管理SNS風アプリ。他ユーザーの旅行投稿にいいね・「行きたい！」を押すと、AIキャラクター**ナビちゃん**との会話スレッドが生成され、旅行プランを相談できます。

## 主な機能

- **タイムライン** — 全ユーザーの旅行投稿を閲覧（全体 / フォロー中の切り替え）
- **投稿** — 写真最大6枚・本文・ハッシュタグ・地図ピン付きで旅行を投稿
- **投稿カード** — 写真スワイプ・地名バッジ・地図ピン連動表示
- **いいね / 行きたい！** — 投稿へのリアクション
- **フォロー** — ユーザーをフォロー・フォロー中投稿のみ表示
- **ナビちゃん** — Claude API搭載のAI旅行プランナー（「行きたい！」からスレッド自動生成・ユーザーの好み記憶）
- **プロフィール** — アバター・自己紹介・投稿一覧・フォロー数表示

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| 言語 | TypeScript 5.x |
| フレームワーク | Next.js 14（App Router） |
| スタイリング | Tailwind CSS 3.x |
| 認証 | NextAuth.js 4.x（メール＋パスワード / JWT） |
| ORM | Prisma 5.x |
| データベース | PostgreSQL 15（開発: Docker / 本番: AWS RDS） |
| ストレージ | ローカルファイル（開発） / AWS S3（本番） |
| 地図 | Leaflet.js + React Leaflet + OpenStreetMap |
| ジオコーディング | Nominatim（OpenStreetMap） |
| AI | Claude API（開発: Haiku / 本番: Sonnet） |
| ホスティング | AWS EC2 |

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
# Database (Docker)
DATABASE_URL="postgresql://postgres:password@localhost:5432/tripdiary"

# NextAuth
NEXTAUTH_SECRET="<openssl rand -base64 32 で生成>"
NEXTAUTH_URL="http://localhost:3000"

# Anthropic Claude API
ANTHROPIC_API_KEY="sk-ant-..."

# Storage (local: 開発用, s3: 本番用)
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

## プロジェクト構成

```
src/
├── app/
│   ├── api/                  # バックエンド（APIエンドポイント）
│   │   ├── auth/             # 認証（NextAuth / 会員登録）
│   │   ├── posts/            # 投稿CRUD・いいね・行きたい！
│   │   ├── follows/          # フォロー
│   │   ├── profiles/         # プロフィール
│   │   ├── navi/             # ナビちゃん（Claude API）
│   │   ├── photos/           # 写真アップロード
│   │   └── geocoding/        # ジオコーディング
│   ├── login/                # ログイン画面
│   ├── register/             # 会員登録画面
│   ├── timeline/             # タイムライン画面
│   ├── following/            # フォロー中タイムライン
│   ├── profile/              # プロフィール画面
│   ├── navi/                 # ナビちゃん画面
│   └── user/[userId]/        # ユーザー投稿詳細
├── components/
│   ├── layout/               # レイアウト（BottomTab等）
│   ├── post/                 # 投稿関連コンポーネント
│   └── map/                  # 地図コンポーネント
├── contexts/                 # React Context（ナビちゃん状態管理）
├── lib/
│   ├── db.ts                 # PrismaClient
│   ├── auth.ts               # NextAuth設定
│   └── mock/                 # モックデータ（プロトタイプ用・後に削除）
└── types/                    # 型定義
prisma/
└── schema.prisma             # DBスキーマ（全10テーブル）
docker-compose.yml            # PostgreSQL開発環境
```

## 開発ロードマップ

- [x] Phase 1：基盤構築（Docker / PostgreSQL / Prisma / NextAuth / 認証画面）
- [ ] Phase 2：投稿CRUD（投稿API / 写真アップロード / タイムラインAPI連携）
- [ ] Phase 3：リアクション・フォロー（いいね / 行きたい！/ フォロー API連携）
- [ ] Phase 4：ナビちゃん（Claude API / ストリーミング / 好み記憶）
