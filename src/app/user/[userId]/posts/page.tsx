'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import PostCard from '@/components/post/PostCard';
import { useNaviThread } from '@/contexts/NaviThreadContext';
import { Post, User } from '@/types';

type ProfileData = User & {
  bio: string | null;
  postCount: number;
  followerCount: number;
  followingCount: number;
};

function UserPostsContent({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { addThreadFromPost } = useNaviThread();
  const targetPostId = searchParams.get('postId');

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/profiles/${params.userId}`),
      fetch(`/api/posts?type=all&limit=50`),
    ]).then(async ([profileRes, postsRes]) => {
      if (!profileRes.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const profileData = await profileRes.json() as ProfileData;
      const postsData = await postsRes.json() as { posts: Post[] };
      setProfile(profileData);
      setFollowing(profileData.isFollowing);
      setPosts(postsData.posts.filter((p) => p.user.id === params.userId));
      setLoading(false);
    });
  }, [params.userId]);

  useEffect(() => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [targetPostId, posts]);

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    const next = !following;
    setFollowing(next);

    const method = next ? 'POST' : 'DELETE';
    const url = next ? '/api/follows' : `/api/follows/${params.userId}`;
    const body = next ? JSON.stringify({ followingId: params.userId }) : undefined;

    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body,
    });
    if (!res.ok) setFollowing(!next);
    setFollowLoading(false);
  };

  const handleWantToGo = async (post: Post) => {
    await addThreadFromPost(post);
    const toast = document.createElement('div');
    toast.textContent = '✈️ ナビちゃんにスレッドを追加したよ！';
    toast.style.cssText = `
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
      background: #1d4ed8; color: white; padding: 10px 20px; border-radius: 24px;
      font-size: 13px; z-index: 9999; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
        読み込み中...
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
        <p>ユーザーが見つかりません</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-500 text-sm">戻る</button>
      </div>
    );
  }

  const isOwnProfile = session?.user?.id === params.userId;

  return (
    <div>
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center gap-3 px-3 h-12">
          <button onClick={() => router.back()} className="p-1 text-gray-400 hover:text-gray-600" aria-label="戻る">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-sm font-bold text-gray-900 truncate flex-1">{profile.name}の投稿</h1>
          {!isOwnProfile && (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                following
                  ? 'border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500'
                  : 'border-blue-400 text-blue-500 hover:bg-blue-50'
              } disabled:opacity-50`}
            >
              {following ? 'フォロー中' : 'フォロー'}
            </button>
          )}
        </div>
      </header>

      {/* ユーザー情報ヘッダー */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-none">
          <Image src={profile.avatarUrl} alt={profile.name} width={56} height={56} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">{profile.name}</p>
          {profile.bio && <p className="text-xs text-gray-400 mt-0.5 truncate">{profile.bio}</p>}
          <p className="text-xs text-gray-400 mt-0.5">{profile.postCount}件の投稿</p>
        </div>
      </div>

      {posts.length > 0 ? (
        <div>
          {posts.map((post) => (
            <div key={post.id} ref={post.id === targetPostId ? targetRef : null}>
              <PostCard post={post} onWantToGo={handleWantToGo} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-4xl mb-3">📷</span>
          <p className="text-sm">まだ投稿がありません</p>
        </div>
      )}
    </div>
  );
}

export default function UserPostsPage({ params }: { params: { userId: string } }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">読み込み中...</div>}>
      <UserPostsContent params={params} />
    </Suspense>
  );
}
