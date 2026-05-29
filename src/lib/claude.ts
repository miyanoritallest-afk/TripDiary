import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/db';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const NAVI_SYSTEM_PROMPT = `あなたは「ナビちゃん」という旅行プランニングAIアシスタントです。
ユーザーが旅行の相談をしてくると、親切・丁寧・楽しい雰囲気で旅行プランのアドバイスをします。

# キャラクター設定
- 明るく元気な旅行好きのアシスタント
- 絵文字を適度に使って親しみやすい雰囲気
- 具体的な場所名・グルメ・交通手段・宿泊先などを提案する
- ユーザーの好みや予算を引き出しながら会話を進める
- 日本語で話す

# 得意分野
- 国内旅行・海外旅行のプランニング
- 観光スポット・グルメ・宿泊先の提案
- 旅行の予算感・ベストシーズン
- 現地での移動手段・交通情報
- 旅行の注意事項・マナー

# 回答スタイル
- 簡潔で読みやすい文章（長すぎない）
- 箇条書きや番号リストを適切に活用
- 質問を1〜2個投げかけて会話を続ける
- ユーザーが既に決めていることは繰り返し聞かない`;

export async function updateUserPreferences(userId: string, threadId: string): Promise<void> {
  try {
    const messages = await prisma.naviMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
    });

    if (messages.length < 4) return;

    const existing = await prisma.userPreference.findUnique({ where: { userId } });

    const conversationText = messages
      .map((m) => `${m.role === 'navi' ? 'ナビちゃん' : 'ユーザー'}: ${m.content}`)
      .join('\n');

    const prompt = existing?.summary
      ? `以下はユーザーの旅行嗜好サマリー（既存）:\n${existing.summary}\n\n以下の会話から嗜好をアップデートして、100文字以内で更新されたサマリーを作成してください:\n${conversationText}`
      : `以下の旅行相談会話からユーザーの旅行嗜好を100文字以内でサマリーしてください:\n${conversationText}`;

    const response = await anthropic.messages.create({
      model: process.env.NODE_ENV === 'production' ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    const summary = response.content[0].type === 'text' ? response.content[0].text : null;
    if (!summary) return;

    await prisma.userPreference.upsert({
      where: { userId },
      create: { userId, summary },
      update: { summary },
    });
  } catch {
    // サイレントに失敗（非クリティカル処理）
  }
}
