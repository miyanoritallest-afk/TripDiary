import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { postToApiResponse } from '@/lib/mappers';

const POST_INCLUDE = {
  user: true,
  photos: { include: { pin: true } },
  likes: true,
  wantToGos: true,
} as const;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const type = searchParams.get('type') ?? 'all';
  const cursor = searchParams.get('cursor') ?? undefined;
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50);

  const currentUserId = session.user.id;

  let whereFollowingIds: string[] | undefined;
  if (type === 'following') {
    const follows = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });
    whereFollowingIds = follows.map((f) => f.followingId);
  }

  const posts = await prisma.post.findMany({
    where: type === 'following' ? { userId: { in: whereFollowingIds ?? [] } } : undefined,
    include: POST_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({
    posts: items.map((p) => postToApiResponse(p, currentUserId)),
    nextCursor,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    body?: string;
    hashtags?: string[];
    photos: { imageUrl: string; displayOrder: number; pin?: { locationName?: string; lat: number; lng: number } }[];
  };

  if (!body.photos || body.photos.length === 0) {
    return NextResponse.json({ error: '写真は1枚以上必要です' }, { status: 400 });
  }
  if (body.photos.length > 6) {
    return NextResponse.json({ error: '写真は最大6枚です' }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      userId: session.user.id,
      body: body.body ?? null,
      hashtags: body.hashtags ?? [],
      photos: {
        create: body.photos.map((p) => ({
          imageUrl: p.imageUrl,
          displayOrder: p.displayOrder,
          ...(p.pin ? {
            pin: {
              create: {
                locationName: p.pin.locationName ?? null,
                latitude: p.pin.lat,
                longitude: p.pin.lng,
              },
            },
          } : {}),
        })),
      },
    },
    include: POST_INCLUDE,
  });

  return NextResponse.json(postToApiResponse(post, session.user.id), { status: 201 });
}
