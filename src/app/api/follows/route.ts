import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { followingId } = await req.json() as { followingId: string };

  if (!followingId) {
    return NextResponse.json({ error: 'followingId が必要です' }, { status: 400 });
  }
  if (followingId === session.user.id) {
    return NextResponse.json({ error: '自分自身はフォローできません' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: followingId } });
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: session.user.id, followingId } },
    create: { followerId: session.user.id, followingId },
    update: {},
  });

  return NextResponse.json({ following: true }, { status: 200 });
}
