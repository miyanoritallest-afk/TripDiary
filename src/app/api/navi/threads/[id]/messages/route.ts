import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { anthropic, NAVI_SYSTEM_PROMPT, updateUserPreferences } from '@/lib/claude';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const thread = await prisma.naviThread.findUnique({
    where: { id: params.id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });

  if (!thread) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (thread.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json() as { content: string };
  if (!body.content?.trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  await prisma.naviMessage.create({
    data: { threadId: params.id, role: 'user', content: body.content.trim() },
  });

  const userPref = await prisma.userPreference.findUnique({
    where: { userId: session.user.id },
  });

  const systemPrompt = userPref?.summary
    ? `${NAVI_SYSTEM_PROMPT}\n\n# このユーザーの旅行嗜好\n${userPref.summary}`
    : NAVI_SYSTEM_PROMPT;

  const allMessages = await prisma.naviMessage.findMany({
    where: { threadId: params.id },
    orderBy: { createdAt: 'asc' },
  });

  const claudeMessages = allMessages.map((m) => ({
    role: m.role === 'navi' ? ('assistant' as const) : ('user' as const),
    content: m.content,
  }));

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      let fullContent = '';

      try {
        const claudeStream = anthropic.messages.stream({
          model: process.env.NODE_ENV === 'production' ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: systemPrompt,
          messages: claudeMessages,
        });

        for await (const event of claudeStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const chunk = event.delta.text;
            fullContent += chunk;
            controller.enqueue(
              enc.encode(`data: ${JSON.stringify({ type: 'delta', content: chunk })}\n\n`),
            );
          }
        }
      } catch (err) {
        // Claude API 失敗時はフォールバック返信をそのまま送る
        console.error('[Navi] Claude API error:', err);
        fullContent = 'ごめんなさい、今ちょっと調子が悪いみたい😢 もう一度話しかけてみてください！';
        controller.enqueue(
          enc.encode(`data: ${JSON.stringify({ type: 'delta', content: fullContent })}\n\n`),
        );
      }

      try {
        const saved = await prisma.naviMessage.create({
          data: { threadId: params.id, role: 'navi', content: fullContent },
        });

        await prisma.naviThread.update({
          where: { id: params.id },
          data: { updatedAt: new Date() },
        });

        controller.enqueue(
          enc.encode(`data: ${JSON.stringify({ type: 'done', messageId: saved.id })}\n\n`),
        );

        updateUserPreferences(session.user.id, params.id).catch(() => {});
      } catch {
        // DB保存失敗は無視してストリームは閉じる
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
