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
| データベース | PostgreSQL（AWS RDS） | 15.x |
| ストレージ | AWS S3 | — |
| 地図 | Leaflet.js + React Leaflet | 1.9.x / 4.x |
| 地名検索 | Nominatim（OpenStreetMap） | — |
| AI | Claude API（Anthropic SDK） | 最新 |
| ホスティング | AWS EC2 | — |
| パッケージマネージャー | npm | — |

---

## 2. 各技術の採用理由

#### Next.js 14（App Router）
フロントエンドとバックエンドAPIを単一リポジトリで管理できるフルスタックフレームワーク。App RouterによりServer ComponentsとRoute Handlersを活用し、シンプルな構成で開発できる。EC2上でNode.jsサーバーとして `next start` で起動する。

#### TypeScript
型安全性により実行前にバグを検出できる。Next.jsとの相性も良く、コードの可読性・保守性が向上する。

#### Tailwind CSS
ユーティリティファーストのCSSフレームワーク。クラス名でスタイルを直接記述できるため、コンポーネントとスタイルが同一ファイルにまとまり開発効率が高い。

#### NextAuth.js
Next.jsに特化した認証ライブラリ。メール＋パスワード認証に加え、将来的なOAuth（Google等）追加も容易。セッション管理・ルート保護が組み込みで提供される。

#### Prisma
TypeScriptネイティブのORM。スキーマファイルからDB定義・型定義を一元管理でき、マイグレーションも簡単。PostgreSQL（AWS RDS）との相性が良い。

#### AWS RDS（PostgreSQL）
マネージドなPostgreSQLサービス。EC2と同一VPC内に配置することで安全に接続できる。自動バックアップ・フェイルオーバー機能を持ち、本番運用に適している。

#### AWS S3
スケーラブルなオブジェクトストレージ。投稿写真・アバター画像を保存し、公開URLまたは署名付きURLで配信する。IAMロールでアクセス制御を行い、アクセスキーのコード埋め込みを不要にする。

#### Leaflet.js + React Leaflet
オープンソースの地図ライブラリ。OpenStreetMapと組み合わせることで無料で地図・ピン表示を実現できる。React Leafletにより宣言的な記述が可能。

#### Nominatim（OpenStreetMap）
地名から緯度経度を検索できる無料のジオコーディングAPI。投稿時の場所名入力から座標を取得するために使用する。

#### Claude API（Anthropic SDK）
ナビちゃんの会話エンジン。旅行プランに関する自然な会話・プラン提案が得意。開発時はHaiku（コスト効率重視）、本番ではSonnet（品質重視）を使い分ける。

---

## 3. アーキテクチャ概要

```
[ブラウザ（PC）]
    │
    ▼
[AWS EC2（Next.js App Router）]
    │── /api/auth/*         → NextAuth.js（認証）
    │── /api/posts/*        → Route Handler（投稿CRUD）
    │── /api/navi/*         → Route Handler（Claude API呼び出し）
    │── /*（画面）          → Server / Client Component
                │
                ├── Prisma ORM → AWS RDS（PostgreSQL）
                └── AWS SDK（S3） → AWS S3（写真）
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
| `DATABASE_URL` | PostgreSQL接続URL（ローカルは `postgresql://...@localhost:5432/tripdiary`） |
| `NEXTAUTH_SECRET` | NextAuth.jsセッション署名シークレット |
| `NEXTAUTH_URL` | アプリのベースURL（ローカルは `http://localhost:3000`） |
| `AWS_REGION` | S3バケットのリージョン（例: `ap-northeast-1`） |
| `AWS_S3_BUCKET_NAME` | S3バケット名 |
| `AWS_ACCESS_KEY_ID` | AWSアクセスキー（ローカル開発用。EC2本番ではIAMロールで不要） |
| `AWS_SECRET_ACCESS_KEY` | AWSシークレットキー（ローカル開発用。EC2本番ではIAMロールで不要） |
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

CI/CDの詳細は今後のフェーズで設計予定。現時点の方針は以下の通り。

| トリガー | 動作（予定） |
|---------|------------|
| mainブランチへのマージ | EC2上でビルド・再起動（手動または GitHub Actions） |
