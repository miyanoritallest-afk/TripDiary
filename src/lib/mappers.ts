import type {
  User as PrismaUser,
  Post as PrismaPost,
  Photo as PrismaPhoto,
  Pin as PrismaPin,
  Follow as PrismaFollow,
} from '@prisma/client';
import type { Post, User } from '@/types';

type PhotoWithPin = PrismaPhoto & { pin: PrismaPin | null };
type PostWithRelations = PrismaPost & {
  user: PrismaUser & { followers: { id: string }[] };
  photos: PhotoWithPin[];
  _count: { likes: number; wantToGos: number };
  likes: { id: string }[];
  wantToGos: { id: string }[];
};
type UserWithCounts = PrismaUser & {
  _count: { following: number; followers: number; posts: number };
  following: PrismaFollow[];
};

export function createPostInclude(currentUserId: string) {
  return {
    user: {
      include: {
        followers: {
          where: { followerId: currentUserId },
          select: { id: true },
          take: 1,
        },
      },
    },
    photos: { include: { pin: true } },
    _count: { select: { likes: true, wantToGos: true } },
    likes: { where: { userId: currentUserId }, select: { id: true } },
    wantToGos: { where: { userId: currentUserId }, select: { id: true } },
  };
}

export function postToApiResponse(post: PostWithRelations, _currentUserId: string): Post {
  const sorted = [...post.photos].sort((a, b) => a.displayOrder - b.displayOrder);

  return {
    id: post.id,
    user: {
      id: post.user.id,
      name: post.user.username,
      avatarUrl: post.user.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.username)}&background=random`,
      isFollowing: post.user.followers.length > 0,
    },
    photoUrls: sorted.map((p) => p.imageUrl),
    photoPins: sorted
      .filter((p) => p.pin !== null)
      .map((p) => ({
        photoIndex: sorted.indexOf(p),
        locationName: p.pin!.locationName ?? '',
        lat: Number(p.pin!.latitude),
        lng: Number(p.pin!.longitude),
      })),
    body: post.body ?? '',
    hashtags: post.hashtags,
    likeCount: post._count.likes,
    wantToGoCount: post._count.wantToGos,
    isLiked: post.likes.length > 0,
    isWantToGo: post.wantToGos.length > 0,
    createdAt: post.createdAt.toISOString(),
  };
}

export function userToApiResponse(user: UserWithCounts): User & {
  bio: string | null;
  postCount: number;
  followerCount: number;
  followingCount: number;
} {
  return {
    id: user.id,
    name: user.username,
    avatarUrl: user.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`,
    isFollowing: user.following.length > 0,
    bio: user.bio,
    postCount: user._count.posts,
    followerCount: user._count.followers,
    followingCount: user._count.following,
  };
}
