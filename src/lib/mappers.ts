import type {
  User as PrismaUser,
  Post as PrismaPost,
  Photo as PrismaPhoto,
  Pin as PrismaPin,
  Like as PrismaLike,
  WantToGo as PrismaWantToGo,
  Follow as PrismaFollow,
} from '@prisma/client';
import type { Post, User } from '@/types';

type PhotoWithPin = PrismaPhoto & { pin: PrismaPin | null };
type PostWithRelations = PrismaPost & {
  user: PrismaUser;
  photos: PhotoWithPin[];
  likes: PrismaLike[];
  wantToGos: PrismaWantToGo[];
};
type UserWithCounts = PrismaUser & {
  _count: { following: number; followers: number; posts: number };
  following: PrismaFollow[];
};

export function postToApiResponse(post: PostWithRelations, currentUserId: string): Post {
  const sorted = [...post.photos].sort((a, b) => a.displayOrder - b.displayOrder);

  return {
    id: post.id,
    user: {
      id: post.user.id,
      name: post.user.username,
      avatarUrl: post.user.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.username)}&background=random`,
      isFollowing: false,
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
    likeCount: post.likes.length,
    wantToGoCount: post.wantToGos.length,
    isLiked: post.likes.some((l) => l.userId === currentUserId),
    isWantToGo: post.wantToGos.some((w) => w.userId === currentUserId),
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
