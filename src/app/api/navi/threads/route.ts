import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { anthropic, NAVI_SYSTEM_PROMPT } from '@/lib/claude';

function threadToResponse(thread: {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  sourcePostId: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages: { id: string; role: string; content: string; createdAt: Date }[];
}) {
  return {
    id: thread.id,
    title: thread.title,
    thumbnailUrl: thread.thumbnailUrl ?? 'https://picsum.photos/seed/navi/400/400',
    sourcePostId: thread.sourcePostId ?? undefined,
    messages: thread.messages.map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'navi',
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const threads = await prisma.naviThread.findMany({
    where: { userId: session.user.id },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(threads.map(threadToResponse));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    title: string;
    sourcePostId?: string;
    thumbnailUrl?: string;
    initialContext?: string;
  };

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const userPref = await prisma.userPreference.findUnique({
    where: { userId: session.user.id },
  });

  const systemPrompt = userPref?.summary
    ? `${NAVI_SYSTEM_PROMPT}\n\n# このユーザーの旅行嗜好\n${userPref.summary}`
    : NAVI_SYSTEM_PROMPT;

  const userMsg = body.initialContext
    ? body.initialContext
    : `「${body.title}」について旅の相談を始めたいです。`;

  // sourcePostId がある（＝「行きたい！」からの起動）場合は目的地名を活かしたフォールバック
  const destinationName = body.title.replace(/の旅プラン$/, '').replace(/について$/, '').trim();
  const fallbackContent = body.sourcePostId
    ? `${destinationName}に興味があるんですね！✈️ いつ頃行きたいですか？また、観光・グルメ・アクティビティなど、特にやってみたいことはありますか？`
    : `こんにちは！「${destinationName}」への旅、一緒に計画しましょう😊 いつ頃・どんなスタイルで行きたいか教えてください！`;

  let initialContent = fallbackContent;
  try {
    const aiResponse = await anthropic.messages.create({
      model: process.env.NODE_ENV === 'production' ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMsg }],
    });
    if (aiResponse.content[0].type === 'text') {
      initialContent = aiResponse.content[0].text;
    }
  } catch {
    // APIキー未設定などの場合はフォールバックテキストを使用
  }

  const thread = await prisma.naviThread.create({
    data: {
      userId: session.user.id,
      title: body.title.trim(),
      thumbnailUrl: body.thumbnailUrl ?? null,
      sourcePostId: body.sourcePostId ?? null,
      messages: {
        create: {
          role: 'navi',
          content: initialContent,
        },
      },
    },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  return NextResponse.json(threadToResponse(thread), { status: 201 });
}
