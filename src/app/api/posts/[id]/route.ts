import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { postToApiResponse, createPostInclude } from '@/lib/mappers';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: createPostInclude(session.user.id),
  });

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(postToApiResponse(post, session.user.id));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (post.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.post.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
