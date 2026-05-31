import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── ユーザー ──────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  const haruto = await prisma.user.upsert({
    where: { email: 'haruto@example.com' },
    update: {},
    create: {
      email: 'haruto@example.com',
      passwordHash,
      username: 'はると',
      bio: 'ゲームとアニメが好き。イベントがあれば全国どこでも行きます！',
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=haruto`,
    },
  });

  const yuki = await prisma.user.upsert({
    where: { email: 'yuki@example.com' },
    update: {},
    create: {
      email: 'yuki@example.com',
      passwordHash,
      username: 'Yuki',
      bio: '週末は一人でどこかへ。海と魚が好きです🐟',
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=yuki`,
    },
  });

  const misaki = await prisma.user.upsert({
    where: { email: 'misaki@example.com' },
    update: {},
    create: {
      email: 'misaki@example.com',
      passwordHash,
      username: 'みさき',
      bio: '京都大好き。神社仏閣を巡るのが趣味です⛩',
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=misaki`,
    },
  });

  const ryo = await prisma.user.upsert({
    where: { email: 'ryo@example.com' },
    update: {},
    create: {
      email: 'ryo@example.com',
      passwordHash,
      username: 'Ryo',
      bio: '野球観戦と街歩きが好き。東京スポット巡り中⚾',
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=ryo`,
    },
  });

  const sora = await prisma.user.upsert({
    where: { email: 'sora@example.com' },
    update: {},
    create: {
      email: 'sora@example.com',
      passwordHash,
      username: 'そら',
      bio: '自然と絶景が好き。山と火山のある場所に惹かれます🌋',
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=sora`,
    },
  });

  console.log('✅ ユーザー5名作成');

  // ── 投稿1: はると — 東京ビッグサイト ─────────────────────────────────
  const post1 = await prisma.post.upsert({
    where: { id: 'seed-post-001' },
    update: {},
    create: {
      id: 'seed-post-001',
      userId: haruto.id,
      body: 'RAGE Overwatch2のイベントに参加してきた！会場の熱気がすごすぎた🔥 東京ビッグサイトってデカすぎて迷子になりかけた笑',
      hashtags: ['RAGE', 'Overwatch2', '東京ビッグサイト', 'eスポーツ'],
      photos: {
        create: [
          {
            id: 'seed-photo-001a',
            imageUrl: '/uploads/seed/bigsight_event.jpg',
            displayOrder: 0,
            pin: {
              create: {
                locationName: '東京ビッグサイト',
                latitude: 35.6298,
                longitude: 139.7942,
              },
            },
          },
          {
            id: 'seed-photo-001b',
            imageUrl: '/uploads/seed/bigsight_outside.jpg',
            displayOrder: 1,
          },
        ],
      },
    },
  });

  // ── 投稿2: Yuki — 三浦半島 ────────────────────────────────────────────
  const post2 = await prisma.post.upsert({
    where: { id: 'seed-post-002' },
    update: {},
    create: {
      id: 'seed-post-002',
      userId: yuki.id,
      body: '三浦半島を一人旅してきました。城ヶ島の断崖から見る海は迫力満点！まぐろの刺し盛りも絶品でした🐟 三崎港グルメは最高すぎる',
      hashtags: ['三浦半島', '城ヶ島', '三崎まぐろ', '一人旅'],
      photos: {
        create: [
          {
            id: 'seed-photo-002a',
            imageUrl: '/uploads/seed/miura_sashimi.jpg',
            displayOrder: 0,
            pin: {
              create: {
                locationName: '城ヶ島',
                latitude: 35.1333,
                longitude: 139.6167,
              },
            },
          },
          {
            id: 'seed-photo-002b',
            imageUrl: '/uploads/seed/miura_sea.jpg',
            displayOrder: 1,
          },
        ],
      },
    },
  });

  // ── 投稿3: みさき — 清水寺 ────────────────────────────────────────────
  const post3 = await prisma.post.upsert({
    where: { id: 'seed-post-003' },
    update: {},
    create: {
      id: 'seed-post-003',
      userId: misaki.id,
      body: '初めて清水寺に行きました！清水の舞台から見る京都の景色に感動😭 紅葉の季節に来られてよかった。また絶対来る⛩',
      hashtags: ['清水寺', '京都', '紅葉', '初めての京都'],
      photos: {
        create: [
          {
            id: 'seed-photo-003a',
            imageUrl: '/uploads/seed/kiyomizudera.jpg',
            displayOrder: 0,
            pin: {
              create: {
                locationName: '清水寺',
                latitude: 34.9949,
                longitude: 135.7851,
              },
            },
          },
        ],
      },
    },
  });

  // ── 投稿4: Ryo — 東京ドーム ───────────────────────────────────────────
  const post4 = await prisma.post.upsert({
    where: { id: 'seed-post-004' },
    update: {},
    create: {
      id: 'seed-post-004',
      userId: ryo.id,
      body: '東京ドームで巨人戦観戦⚾ 開幕戦で雰囲気最高だった！試合後は浅草まで歩いて散策。東京って歩いても楽しいね',
      hashtags: ['東京ドーム', '読売ジャイアンツ', '野球観戦', '浅草'],
      photos: {
        create: [
          {
            id: 'seed-photo-004a',
            imageUrl: '/uploads/seed/tokyo_dome.jpg',
            displayOrder: 0,
            pin: {
              create: {
                locationName: '東京ドーム',
                latitude: 35.7056,
                longitude: 139.7519,
              },
            },
          },
          {
            id: 'seed-photo-004b',
            imageUrl: '/uploads/seed/giants_vision.jpg',
            displayOrder: 1,
          },
          {
            id: 'seed-photo-004c',
            imageUrl: '/uploads/seed/tokyo_dome_game.jpg',
            displayOrder: 2,
          },
        ],
      },
    },
  });

  // ── 投稿5: そら — 熊本・阿蘇 ─────────────────────────────────────────
  const post5 = await prisma.post.upsert({
    where: { id: 'seed-post-005' },
    update: {},
    create: {
      id: 'seed-post-005',
      userId: sora.id,
      body: '熊本・阿蘇に行ってきました🌋 野焼きの炎と煙が迫力ありすぎ！大観峰からの眺めは360度の絶景。阿蘇カルデラのスケールに圧倒された',
      hashtags: ['阿蘇', '熊本', '大観峰', '野焼き', '絶景'],
      photos: {
        create: [
          {
            id: 'seed-photo-005a',
            imageUrl: '/uploads/seed/aso_noyaki.jpg',
            displayOrder: 0,
            pin: {
              create: {
                locationName: '大観峰',
                latitude: 33.0486,
                longitude: 131.1064,
              },
            },
          },
          {
            id: 'seed-photo-005b',
            imageUrl: '/uploads/seed/daikanbo.jpg',
            displayOrder: 1,
          },
        ],
      },
    },
  });

  console.log('✅ 投稿5件作成');

  // ── フォロー関係 ──────────────────────────────────────────────────────
  const follows = [
    { followerId: haruto.id, followingId: yuki.id },
    { followerId: haruto.id, followingId: ryo.id },
    { followerId: yuki.id, followingId: haruto.id },
    { followerId: yuki.id, followingId: misaki.id },
    { followerId: yuki.id, followingId: sora.id },
    { followerId: misaki.id, followingId: yuki.id },
    { followerId: misaki.id, followingId: sora.id },
    { followerId: ryo.id, followingId: haruto.id },
    { followerId: ryo.id, followingId: yuki.id },
    { followerId: sora.id, followingId: misaki.id },
    { followerId: sora.id, followingId: ryo.id },
  ];

  for (const f of follows) {
    await prisma.follow.upsert({
      where: { followerId_followingId: f },
      update: {},
      create: f,
    });
  }

  console.log('✅ フォロー関係設定');

  // ── いいね ────────────────────────────────────────────────────────────
  const likes = [
    { id: 'seed-like-001', postId: post1.id, userId: yuki.id },
    { id: 'seed-like-002', postId: post1.id, userId: ryo.id },
    { id: 'seed-like-003', postId: post2.id, userId: haruto.id },
    { id: 'seed-like-004', postId: post2.id, userId: misaki.id },
    { id: 'seed-like-005', postId: post3.id, userId: yuki.id },
    { id: 'seed-like-006', postId: post3.id, userId: sora.id },
    { id: 'seed-like-007', postId: post4.id, userId: haruto.id },
    { id: 'seed-like-008', postId: post5.id, userId: misaki.id },
    { id: 'seed-like-009', postId: post5.id, userId: ryo.id },
  ];

  for (const l of likes) {
    await prisma.like.upsert({
      where: { postId_userId: { postId: l.postId, userId: l.userId } },
      update: {},
      create: l,
    });
  }

  console.log('✅ いいね設定');

  // ── 行きたい！ ────────────────────────────────────────────────────────
  const wantToGos = [
    { id: 'seed-wtg-001', postId: post2.id, userId: sora.id },
    { id: 'seed-wtg-002', postId: post3.id, userId: haruto.id },
    { id: 'seed-wtg-003', postId: post5.id, userId: yuki.id },
  ];

  for (const w of wantToGos) {
    await prisma.wantToGo.upsert({
      where: { postId_userId: { postId: w.postId, userId: w.userId } },
      update: {},
      create: w,
    });
  }

  console.log('✅ 行きたい！設定');
  console.log('🌱 シード完了');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
