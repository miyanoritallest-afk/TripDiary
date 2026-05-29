import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { userToApiResponse } from '@/lib/mappers';

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      _count: { select: { following: true, followers: true, posts: true } },
      following: {
        where: { followerId: session.user.id },
        take: 1,
      },
    },
  });

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(userToApiResponse(user));
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.id !== params.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json() as { username?: string; bio?: string; avatarUrl?: string };

  const user = await prisma.user.update({
    where: { id: params.userId },
    data: {
      ...(body.username !== undefined ? { username: body.username } : {}),
      ...(body.bio !== undefined ? { bio: body.bio } : {}),
      ...(body.avatarUrl !== undefined ? { avatarUrl: body.avatarUrl } : {}),
    },
    include: {
      _count: { select: { following: true, followers: true, posts: true } },
      following: {
        where: { followerId: session.user.id },
        take: 1,
      },
    },
  });

  return NextResponse.json(userToApiResponse(user));
}
