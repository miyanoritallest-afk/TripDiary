'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { mockPosts } from '@/lib/mock/posts';
import { mockUsers } from '@/lib/mock/users';

// プロトタイプ: user_1（田中さくら）をログインユーザーと仮定
const ME = mockUsers[0];
const myPosts = mockPosts.filter((p) => p.user.id === ME.id);
// フォロワー/フォロー中のダミーデータ（プロトタイプ）
const FOLLOWERS = mockUsers.filter((u) => u.id !== ME.id).slice(0, 3);
const FOLLOWING = mockUsers.filter((u) => u.isFollowing && u.id !== ME.id);

export default function ProfilePage() {
  const [userListModal, setUserListModal] = useState<'followers' | 'following' | null>(null);

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
            src={ME.avatarUrl}
            alt={ME.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-gray-900">{ME.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">@{ME.id}</p>
        </div>
        <div className="flex gap-8 mt-1">
          <div className="text-center">
            <p className="text-base font-bold text-gray-900">{myPosts.length}</p>
            <p className="text-xs text-gray-400">投稿</p>
          </div>
          <button className="text-center" onClick={() => setUserListModal('followers')}>
            <p className="text-base font-bold text-gray-900">128</p>
            <p className="text-xs text-gray-400">フォロワー</p>
          </button>
          <button className="text-center" onClick={() => setUserListModal('following')}>
            <p className="text-base font-bold text-gray-900">64</p>
            <p className="text-xs text-gray-400">フォロー中</p>
          </button>
        </div>
      </div>

      {/* 投稿グリッド */}
      {myPosts.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5 bg-gray-100">
          {myPosts.map((post) => (
            <Link key={post.id} href={`/user/${ME.id}/posts?postId=${post.id}`} className="aspect-square overflow-hidden bg-gray-200 block">
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

      {/* フォロワー/フォロー中モーダル */}
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
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {(userListModal === 'followers' ? FOLLOWERS : FOLLOWING).map((user) => (
                <div key={user.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-none bg-gray-100">
                    <Image src={user.avatarUrl} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400">@{user.id}</p>
                  </div>
                  <button className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-300 text-gray-600">
                    {userListModal === 'followers' ? 'フォロー' : 'フォロー中'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
