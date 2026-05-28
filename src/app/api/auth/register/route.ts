import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, username } = body;

  if (!email || !password || !username) {
    return NextResponse.json(
      { error: 'メール・パスワード・ユーザー名は必須です' },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'パスワードは8文字以上で入力してください' },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: 'このメールアドレスはすでに使用されています' },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, passwordHash, username },
  });

  return NextResponse.json(
    { id: user.id, email: user.email, username: user.username },
    { status: 201 }
  );
}
