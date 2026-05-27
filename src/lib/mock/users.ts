import { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'user_1',
    name: '田中さくら',
    avatarUrl: 'https://ui-avatars.com/api/?name=田中さくら&background=f9a8d4&color=fff&size=128',
    isFollowing: true,
  },
  {
    id: 'user_2',
    name: '山田たろう',
    avatarUrl: 'https://ui-avatars.com/api/?name=山田たろう&background=93c5fd&color=fff&size=128',
    isFollowing: true,
  },
  {
    id: 'user_3',
    name: '佐藤はな',
    avatarUrl: 'https://ui-avatars.com/api/?name=佐藤はな&background=6ee7b7&color=fff&size=128',
    isFollowing: false,
  },
  {
    id: 'user_4',
    name: '鈴木けんじ',
    avatarUrl: 'https://ui-avatars.com/api/?name=鈴木けんじ&background=fcd34d&color=fff&size=128',
    isFollowing: false,
  },
  {
    id: 'user_5',
    name: '伊藤みか',
    avatarUrl: 'https://ui-avatars.com/api/?name=伊藤みか&background=c4b5fd&color=fff&size=128',
    isFollowing: true,
  },
];
