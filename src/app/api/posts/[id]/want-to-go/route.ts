import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.wantToGo.upsert({
    where: { postId_userId: { postId: params.id, userId: session.user.id } },
    create: { postId: params.id, userId: session.user.id },
    update: {},
  });

  const count = await prisma.wantToGo.count({ where: { postId: params.id } });
  return NextResponse.json({ wantToGoCount: count }, { status: 200 });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.wantToGo.deleteMany({
    where: { postId: params.id, userId: session.user.id },
  });

  const count = await prisma.wantToGo.count({ where: { postId: params.id } });
  return NextResponse.json({ wantToGoCount: count }, { status: 200 });
}
