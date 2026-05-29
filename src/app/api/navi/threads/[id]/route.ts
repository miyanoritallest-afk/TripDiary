import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  _req: NextRequest,
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

  return NextResponse.json({
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
  });
}
