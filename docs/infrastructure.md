# TripDiary インフラ構成

作成日: 2026-05-28
最終更新日: 2026-05-28

---

## 1. 概要

| 項目 | 内容 |
|------|------|
| ホスティング | Vercel |
| データベース | Supabase（PostgreSQL 15） |
| ファイルストレージ | Supabase Storage |
| AI | Anthropic Claude API |
| 地図・ジオコーディング | OpenStreetMap / Nominatim（外部サービス） |

サーバー管理不要のサーバーレス構成。インフラのセットアップをVercel・Supabaseのマネージドサービスに委ねることで、開発・運用コストを最小化する。

---

## 2. インフラ構成図

```
[ブラウザ]
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│                       Vercel                            │
│              Next.js（App Router）                      │
│                                                         │
│   画面（Server / Client Component）                     │
│   APIルート（Route Handlers）                           │
│       ├── /api/auth/*   ← NextAuth.js                  │
│       ├── /api/posts/*  ← 投稿CRUD                     │
│       └── /api/navi/*   ← Claude API呼び出し           │
└──────────────┬──────────────────┬───────────────────────┘
               │                  │
               ▼                  ▼
┌──────────────────────┐  ┌───────────────────────────────┐
│      Supabase        │  │      Anthropic Claude API     │
│                      │  │                               │
│  PostgreSQL（DB）    │  │  会話生成・好みサマリー更新    │
│  Storage（写真）     │  │  Haiku（dev）/ Sonnet（prod）  │
└──────────────────────┘  └───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│               OpenStreetMap / Nominatim               │
│              地名からの緯度経度検索（ジオコーディング） │
└──────────────────────────────────────────────────────┘
```

---

## 3. 各サービスの役割

### Vercel

| 役割 | 内容 |
|------|------|
| フロントエンド配信 | Next.jsアプリをEdge Networkで配信、CDN自動適用 |
| APIサーバー | Route HandlerがサーバーレスFunctionとして実行される |
| 環境変数管理 | Vercelダッシュボードで本番・プレビュー環境の環境変数を管理 |
| CI/CD | GitHubリポジトリと連携、mainマージで自動デプロイ |
| プレビューデプロイ | PR毎にプレビュー環境を自動生成 |

### Supabase

| 役割 | 内容 |
|------|------|
| PostgreSQLデータベース | 全アプリデータを管理（ユーザー・投稿・ピン・リアクション等） |
| Supabase Storage | ユーザーアバター・投稿写真を保存。公開URLで配信 |
| Row Level Security | DB行レベルのアクセス制御（将来的に活用） |

**Supabase Storage バケット設計:**

| バケット名 | 用途 | アクセス |
|-----------|------|---------|
| `avatars` | ユーザーアバター画像 | Public |
| `post-photos` | 投稿写真 | Public |

**Storageオブジェクトキー構成:**

```
avatars/
└── {user_id}/{filename}

post-photos/
└── {post_id}/{display_order}_{filename}
```

### Anthropic Claude API

| 役割 | 内容 |
|------|------|
| ナビちゃん会話生成 | ユーザーのメッセージに対して旅行プランのアドバイスを返す |
| 好みサマリー更新 | 会話終了後、ユーザーの旅行好みをサマリーとして生成しDBに保存 |

| 環境 | 使用モデル | 理由 |
|------|----------|------|
| 開発（dev） | claude-haiku-4-5 | コスト効率重視 |
| 本番（prod） | claude-sonnet-4-6 | 応答品質重視 |

---

## 4. 環境構成

| 環境 | ブランチ | URL | DB |
|------|---------|-----|----|
| 本番 | main | https://tripdiary.vercel.app（例） | Supabase本番プロジェクト |
| プレビュー | PRブランチ | Vercel自動生成URL | Supabase本番プロジェクト（共有） |
| ローカル開発 | 任意 | http://localhost:3000 | Supabase本番プロジェクト（共有）またはローカルSupabase |

---

## 5. セキュリティ

| 項目 | 対応 |
|------|------|
| APIキー管理 | `ANTHROPIC_API_KEY` / `SUPABASE_SERVICE_ROLE_KEY` はVercel環境変数で管理。クライアントに露出させない |
| Claude API呼び出し | サーバーサイド（Route Handler）のみで実行 |
| Supabase Storage | Public読み取り可だが、書き込みはサービスロールキーを持つサーバーサイドのみ |
| 認証保護 | NextAuth.jsのミドルウェアで未認証アクセスをログイン画面へリダイレクト |
| パスワード保存 | BCryptによるハッシュ化（NextAuth.jsの標準実装） |

---

## 6. コスト概算（フリープラン範囲）

| サービス | フリープラン制限 | 備考 |
|---------|----------------|------|
| Vercel | 100GB帯域幅/月、Serverless Function実行時間制限あり | 個人利用・開発段階では十分 |
| Supabase | 500MB DB、1GB Storage、50,000 MAU | 開発・小規模運用では十分 |
| Anthropic Claude API | 従量課金（無料枠なし） | Haikuは安価（$0.25/MTok入力） |
| OpenStreetMap/Nominatim | 無料（利用ポリシー遵守） | 大量リクエスト時は自前ホスティングを検討 |
