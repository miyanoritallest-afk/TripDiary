import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const follows = await prisma.follow.findMany({
    where: { followingId: params.userId },
    include: {
      follower: {
        include: {
          _count: { select: { following: true, followers: true, posts: true } },
          followers: {
            where: { followerId: session.user.id },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const users = follows.map((f) => ({
    id: f.follower.id,
    name: f.follower.username,
    avatarUrl: f.follower.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(f.follower.username)}&background=random`,
    isFollowing: f.follower.followers.length > 0,
  }));

  return NextResponse.json(users);
}
