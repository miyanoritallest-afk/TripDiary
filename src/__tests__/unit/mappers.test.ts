import { describe, it, expect } from 'vitest';
import { postToApiResponse, userToApiResponse } from '@/lib/mappers';
import type { Decimal } from '@prisma/client/runtime/library';

const toDecimal = (n: number): Decimal => n as unknown as Decimal;

const baseUser = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  passwordHash: 'hash',
  avatarUrl: null,
  bio: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const basePost = {
  id: 'post-1',
  userId: 'user-1',
  body: 'テスト投稿',
  hashtags: ['#旅行', '#観光'],
  createdAt: new Date('2024-06-01T12:00:00Z'),
  updatedAt: new Date('2024-06-01T12:00:00Z'),
};

describe('postToApiResponse', () => {
  it('基本フィールドを正しくマッピングする', () => {
    const input = {
      ...basePost,
      user: baseUser,
      photos: [],
      likes: [],
      wantToGos: [],
    };

    const result = postToApiResponse(input, 'current-user');

    expect(result.id).toBe('post-1');
    expect(result.body).toBe('テスト投稿');
    expect(result.hashtags).toEqual(['#旅行', '#観光']);
    expect(result.likeCount).toBe(0);
    expect(result.wantToGoCount).toBe(0);
    expect(result.isLiked).toBe(false);
    expect(result.isWantToGo).toBe(false);
    expect(result.createdAt).toBe('2024-06-01T12:00:00.000Z');
  });

  it('avatarUrl が null のとき ui-avatars フォールバックを使う', () => {
    const input = {
      ...basePost,
      user: { ...baseUser, avatarUrl: null },
      photos: [],
      likes: [],
      wantToGos: [],
    };

    const result = postToApiResponse(input, 'current-user');

    expect(result.user.avatarUrl).toContain('ui-avatars.com');
    expect(result.user.avatarUrl).toContain(encodeURIComponent('testuser'));
  });

  it('写真を displayOrder 昇順にソートする', () => {
    const input = {
      ...basePost,
      user: baseUser,
      photos: [
        { id: 'p2', postId: 'post-1', imageUrl: 'url2', displayOrder: 2, createdAt: new Date(), pin: null },
        { id: 'p1', postId: 'post-1', imageUrl: 'url1', displayOrder: 1, createdAt: new Date(), pin: null },
        { id: 'p3', postId: 'post-1', imageUrl: 'url3', displayOrder: 3, createdAt: new Date(), pin: null },
      ],
      likes: [],
      wantToGos: [],
    };

    const result = postToApiResponse(input, 'current-user');

    expect(result.photoUrls).toEqual(['url1', 'url2', 'url3']);
  });

  it('ピン付き写真を photoPins に含める', () => {
    const input = {
      ...basePost,
      user: baseUser,
      photos: [
        {
          id: 'p1', postId: 'post-1', imageUrl: 'url1', displayOrder: 1, createdAt: new Date(),
          pin: {
            id: 'pin-1', photoId: 'p1',
            locationName: '京都・嵐山',
            latitude: toDecimal(35.017),
            longitude: toDecimal(135.678),
            createdAt: new Date(),
          },
        },
      ],
      likes: [],
      wantToGos: [],
    };

    const result = postToApiResponse(input, 'current-user');

    expect(result.photoPins).toHaveLength(1);
    expect(result.photoPins[0].locationName).toBe('京都・嵐山');
    expect(result.photoPins[0].lat).toBe(35.017);
    expect(result.photoPins[0].lng).toBe(135.678);
    expect(result.photoPins[0].photoIndex).toBe(0);
  });

  it('currentUser がいいねしている場合 isLiked が true になる', () => {
    const input = {
      ...basePost,
      user: baseUser,
      photos: [],
      likes: [{ id: 'l1', userId: 'current-user', postId: 'post-1', createdAt: new Date() }],
      wantToGos: [],
    };

    const result = postToApiResponse(input, 'current-user');

    expect(result.isLiked).toBe(true);
    expect(result.likeCount).toBe(1);
  });

  it('body が null のとき空文字を返す', () => {
    const input = {
      ...basePost,
      body: null,
      user: baseUser,
      photos: [],
      likes: [],
      wantToGos: [],
    };

    const result = postToApiResponse(input, 'current-user');

    expect(result.body).toBe('');
  });
});

describe('userToApiResponse', () => {
  it('基本フィールドを正しくマッピングする', () => {
    const input = {
      ...baseUser,
      _count: { following: 5, followers: 10, posts: 3 },
      following: [],
    };

    const result = userToApiResponse(input);

    expect(result.id).toBe('user-1');
    expect(result.name).toBe('testuser');
    expect(result.postCount).toBe(3);
    expect(result.followerCount).toBe(10);
    expect(result.followingCount).toBe(5);
    expect(result.isFollowing).toBe(false);
  });

  it('following 配列が空でないとき isFollowing が true になる', () => {
    const input = {
      ...baseUser,
      _count: { following: 1, followers: 0, posts: 0 },
      following: [{ id: 'f1', followerId: 'other', followingId: 'user-1', createdAt: new Date() }],
    };

    const result = userToApiResponse(input);

    expect(result.isFollowing).toBe(true);
  });

  it('avatarUrl が null のとき ui-avatars フォールバックを使う', () => {
    const input = {
      ...baseUser,
      avatarUrl: null,
      _count: { following: 0, followers: 0, posts: 0 },
      following: [],
    };

    const result = userToApiResponse(input);

    expect(result.avatarUrl).toContain('ui-avatars.com');
  });
});
