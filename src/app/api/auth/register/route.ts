import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  username: z.string().min(3, 'ユーザー名は3文字以上で入力してください').max(20, 'ユーザー名は20文字以内で入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
});

export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'バリデーションエラー';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { email, password, username } = parsed.data;

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json(
      { error: 'このメールアドレスはすでに使用されています' },
      { status: 409 }
    );
  }

  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    return NextResponse.json(
      { error: 'このユーザー名はすでに使用されています' },
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
