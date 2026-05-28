# TripDiary 技術スタック

作成日: 2026-05-28
最終更新日: 2026-05-28

---

## 1. 使用技術一覧

| カテゴリ | 技術 | バージョン |
|---------|------|----------|
| 言語 | TypeScript | 5.x |
| フレームワーク | Next.js | 14.x（App Router） |
| スタイリング | Tailwind CSS | 3.x |
| 認証 | NextAuth.js | 4.x |
| ORM | Prisma | 5.x |
| データベース | PostgreSQL（Supabase） | 15.x |
| ストレージ | Supabase Storage | — |
| 地図 | Leaflet.js + React Leaflet | 1.9.x / 4.x |
| 地名検索 | Nominatim（OpenStreetMap） | — |
| AI | Claude API（Anthropic SDK） | 最新 |
| ホスティング | Vercel | — |
| パッケージマネージャー | npm | — |

---

## 2. 各技術の採用理由

#### Next.js 14（App Router）
フロントエンドとバックエンドAPIを単一リポジトリで管理できるフルスタックフレームワーク。App RouterによりServer ComponentsとRoute Handlersを活用し、シンプルな構成で開発できる。Vercelとの親和性が高く、デプロイが容易。

#### TypeScript
型安全性により実行前にバグを検出できる。Next.jsとの相性も良く、コードの可読性・保守性が向上する。

#### Tailwind CSS
ユーティリティファーストのCSSフレームワーク。クラス名でスタイルを直接記述できるため、コンポーネントとスタイルが同一ファイルにまとまり開発効率が高い。

#### NextAuth.js
Next.jsに特化した認証ライブラリ。メール＋パスワード認証に加え、将来的なOAuth（Google等）追加も容易。セッション管理・ルート保護が組み込みで提供される。

#### Prisma
TypeScriptネイティブのORM。スキーマファイルからDB定義・型定義を一元管理でき、マイグレーションも簡単。PostgreSQL（Supabase）との相性が良い。

#### Supabase（PostgreSQL + Storage）
PostgreSQLホスティングとファイルストレージを一体で提供するBaaS。フリープランで開発・プロトタイプを進められ、本番移行も容易。SupabaseのStorage SDKで写真のアップロード・公開URLの取得がシンプルに実装できる。

#### Leaflet.js + React Leaflet
オープンソースの地図ライブラリ。OpenStreetMapと組み合わせることで無料で地図・ピン表示を実現できる。React Leafletにより宣言的な記述が可能。

#### Nominatim（OpenStreetMap）
地名から緯度経度を検索できる無料のジオコーディングAPI。投稿時の場所名入力から座標を取得するために使用する。

#### Claude API（Anthropic SDK）
ナビちゃんの会話エンジン。旅行プランに関する自然な会話・プラン提案が得意。開発時はHaiku（コスト効率重視）、本番ではSonnet（品質重視）を使い分ける。

---

## 3. アーキテクチャ概要

```
[ブラウザ]
    │
    ▼
[Vercel（Next.js App Router）]
    │── /api/auth/*         → NextAuth.js（認証）
    │── /api/posts/*        → Route Handler（投稿CRUD）
    │── /api/navi/*         → Route Handler（Claude API呼び出し）
    │── /*（画面）          → Server / Client Component
                │
                ├── Prisma ORM → Supabase PostgreSQL
                └── Supabase Storage SDK → Supabase Storage（写真）
```

- フロントエンドとバックエンドAPIは同一Next.jsプロジェクトで管理する
- 地図はクライアントサイドのみでレンダリングする（SSRでLeafletは動作しないため `dynamic import` を使用）
- Claude APIの呼び出しはRoute Handler（サーバーサイド）で行い、APIキーをクライアントに露出させない

---

## 4. ローカル開発環境

### 必要なソフトウェア

| ソフトウェア | バージョン | 用途 |
|------------|----------|------|
| Node.js | 20.x LTS | Next.js実行 |
| npm | 同梱 | パッケージ管理 |

### 環境変数（`.env.local`）

| 変数名 | 内容 |
|--------|------|
| `DATABASE_URL` | SupabaseのPostgreSQL接続URL |
| `NEXTAUTH_SECRET` | NextAuth.jsセッション署名シークレット |
| `NEXTAUTH_URL` | アプリのベースURL（ローカルは `http://localhost:3000`） |
| `SUPABASE_URL` | SupabaseプロジェクトURL |
| `SUPABASE_ANON_KEY` | Supabase匿名キー |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabaseサービスロールキー（サーバーサイドのStorage操作用） |
| `ANTHROPIC_API_KEY` | Claude APIキー |

### 起動手順

```bash
# 依存パッケージのインストール
npm install

# DBマイグレーション
npx prisma migrate dev

# 開発サーバー起動
npm run dev
```

### 接続情報（ローカル）

| サービス | URL |
|---------|-----|
| Next.js Dev Server | http://localhost:3000 |
| Prisma Studio（DB GUI） | `npx prisma studio` → http://localhost:5555 |

---

## 5. CI/CD

Vercelのデプロイメントと連携し、`main` ブランチへのプッシュで本番に自動デプロイされる。
PRごとにプレビューデプロイが作成される。

| トリガー | 動作 |
|---------|------|
| PRオープン / プッシュ | プレビューデプロイ作成 |
| mainブランチへのマージ | 本番デプロイ |
