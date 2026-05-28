# TripDiary

旅行管理SNS風アプリ。他ユーザーの旅行投稿にいいね・「行きたい！」を押すと、AIキャラクター**ナビちゃん**との会話スレッドが生成され、旅行プランを相談できます。

## 主な機能

- **タイムライン** — 全ユーザーの旅行投稿を閲覧
- **フォロー** — フォロー中ユーザーの投稿のみ表示
- **ナビちゃん** — Claude API搭載のAI旅行プランナー（投稿の「行きたい！」からスレッド自動生成）
- **投稿カード** — 写真最大6枚・スワイプ切替・地図ピン連動

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | Next.js 14 + TypeScript + Tailwind CSS |
| 認証 | NextAuth.js（メール＋パスワード）|
| データベース | PostgreSQL + Prisma |
| ストレージ | Supabase Storage |
| 地図 | Leaflet.js + OpenStreetMap |
| AI | Claude API（Haiku / Sonnet）|
| ホスティング | Vercel |

## 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開いてください。

## 開発ロードマップ

- [ ] Phase 1：基盤作成（Next.js・認証・DB）
- [ ] Phase 2：タイムライン（投稿カード・地図ピン・いいね）
- [ ] Phase 3：投稿作成（写真アップロード・場所設定）
- [ ] Phase 4：ナビちゃん（Claude API連携・記憶機能）
