'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Post, User } from '@/types';

type ProfileData = User & {
  bio: string | null;
  postCount: number;
  followerCount: number;
  followingCount: number;
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userListModal, setUserListModal] = useState<'followers' | 'following' | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const userId = session.user.id;
    Promise.all([
      fetch(`/api/profiles/${userId}`).then((r) => r.json()) as Promise<ProfileData>,
      fetch(`/api/posts?type=all&limit=50`).then((r) => r.json()) as Promise<{ posts: Post[] }>,
    ]).then(([profileData, postsData]) => {
      setProfile(profileData);
      setPosts(postsData.posts.filter((p) => p.user.id === userId));
      setLoading(false);
    });
  }, [session]);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
        読み込み中...
      </div>
    );
  }

  return (
    <div>
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 h-12">
          <h1 className="text-lg font-bold text-gray-900">プロフィール</h1>
        </div>
      </header>

      {/* プロフィール情報 */}
      <div className="bg-white px-4 py-6 flex flex-col items-center gap-3 border-b border-gray-100">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
          <Image
            src={profile.avatarUrl}
            alt={profile.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-gray-900">{profile.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">@{profile.id}</p>
          {profile.bio && (
            <p className="text-xs text-gray-500 mt-1 max-w-xs">{profile.bio}</p>
          )}
        </div>
        <div className="flex gap-8 mt-1">
          <div className="text-center">
            <p className="text-base font-bold text-gray-900">{profile.postCount}</p>
            <p className="text-xs text-gray-400">投稿</p>
          </div>
          <button className="text-center" onClick={() => setUserListModal('followers')}>
            <p className="text-base font-bold text-gray-900">{profile.followerCount}</p>
            <p className="text-xs text-gray-400">フォロワー</p>
          </button>
          <button className="text-center" onClick={() => setUserListModal('following')}>
            <p className="text-base font-bold text-gray-900">{profile.followingCount}</p>
            <p className="text-xs text-gray-400">フォロー中</p>
          </button>
        </div>
      </div>

      {/* 投稿グリッド */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5 bg-gray-100">
          {posts.map((post) => (
            <Link key={post.id} href={`/user/${profile.id}/posts?postId=${post.id}`} className="aspect-square overflow-hidden bg-gray-200 block">
              <Image
                src={post.photoUrls[0]}
                alt={post.body.slice(0, 20)}
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-4xl mb-3">📷</span>
          <p className="text-sm">まだ投稿がありません</p>
        </div>
      )}

      {/* フォロワー/フォロー中モーダル（フェーズ3で詳細実装） */}
      {userListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setUserListModal(null)}>
          <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">
                {userListModal === 'followers' ? 'フォロワー' : 'フォロー中'}
              </h2>
              <button onClick={() => setUserListModal(null)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
              フェーズ3で実装予定
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
