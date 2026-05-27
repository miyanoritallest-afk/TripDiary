# TripDiary 🗺️

旅行管理SNS風アプリ。他人の旅行投稿に「いいね」と「行きたい！」ができ、「行きたい！」を押すとAIキャラクター「たびちゃん」が友達のように旅行プランを提案してくれる。

## 技術スタック

- **フロントエンド:** Next.js 14 + TypeScript + Tailwind CSS
- **認証:** NextAuth.js（メール＋パスワード）
- **データベース:** PostgreSQL + Prisma
- **ストレージ:** Supabase Storage（写真）
- **地図:** Leaflet.js + OpenStreetMap + Nominatim
- **AI:** Claude API（たびちゃん）
- **ホスティング:** Vercel

## 画面構成

- 🌍 タイムライン（全ユーザーの投稿）
- 👥 フォロー中（フォローしたユーザーの投稿）
- 🤖 たびちゃん（AIとの旅行プラン相談）

## 開発ロードマップ

- [ ] Phase 1：基盤作成（Next.js・認証・DB）
- [ ] Phase 2：タイムライン（投稿カード・地図ピン・いいね）
- [ ] Phase 3：投稿作成（写真アップロード・場所設定）
- [ ] Phase 4：たびちゃん（Claude API連携・記憶機能）
