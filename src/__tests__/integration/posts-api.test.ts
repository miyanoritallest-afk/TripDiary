import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    follow: { findMany: vi.fn() },
    post: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { POST } from '@/app/api/posts/route';

const mockSession = { user: { id: 'user-1', name: 'testuser', email: 'test@example.com' } };

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('POST /api/posts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('未認証の場合 401 を返す', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const res = await POST(makeRequest({ photos: [{ imageUrl: 'url', displayOrder: 1 }] }));

    expect(res.status).toBe(401);
    const data = await res.json() as { error: string };
    expect(data.error).toBe('Unauthorized');
  });

  it('photos が空配列の場合 400 を返す', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const res = await POST(makeRequest({ photos: [] }));

    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toBe('写真は1枚以上必要です');
  });

  it('photos が 7 枚以上の場合 400 を返す', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const photos = Array.from({ length: 7 }, (_, i) => ({ imageUrl: `url${i}`, displayOrder: i }));
    const res = await POST(makeRequest({ photos }));

    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toBe('写真は最大6枚です');
  });

  it('正常なリクエストで 201 を返す', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const createdPost = {
      id: 'post-new',
      userId: 'user-1',
      body: 'テスト',
      hashtags: [],
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      user: {
        id: 'user-1', username: 'testuser', email: 'test@example.com',
        passwordHash: 'hash', avatarUrl: null, bio: null,
        createdAt: new Date(), updatedAt: new Date(),
      },
      photos: [{ id: 'p1', postId: 'post-new', imageUrl: 'https://example.com/img.jpg', displayOrder: 1, createdAt: new Date(), pin: null }],
      likes: [],
      wantToGos: [],
    };

    vi.mocked(prisma.post.create).mockResolvedValue(createdPost as never);

    const res = await POST(makeRequest({
      body: 'テスト',
      photos: [{ imageUrl: 'https://example.com/img.jpg', displayOrder: 1 }],
    }));

    expect(res.status).toBe(201);
    const data = await res.json() as { id: string };
    expect(data.id).toBe('post-new');
  });
});
