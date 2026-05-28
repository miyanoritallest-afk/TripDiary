'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { mockPosts } from '@/lib/mock/posts';
import { mockUsers } from '@/lib/mock/users';
import PostCard from '@/components/post/PostCard';
import { useNaviThread } from '@/contexts/NaviThreadContext';
import { Post } from '@/types';

function UserPostsContent({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addThreadFromPost } = useNaviThread();
  const targetPostId = searchParams.get('postId');

  const user = mockUsers.find((u) => u.id === params.userId);
  const userPosts = mockPosts.filter((p) => p.user.id === params.userId);

  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [targetPostId]);

  const handleWantToGo = (post: Post) => {
    addThreadFromPost(post);
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
        <p>ユーザーが見つかりません</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-500 text-sm">戻る</button>
      </div>
    );
  }

  return (
    <div>
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center gap-3 px-3 h-12">
          <button onClick={() => router.back()} className="p-1 text-gray-400 hover:text-gray-600" aria-label="戻る">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-sm font-bold text-gray-900 truncate">{user.name}の投稿</h1>
        </div>
      </header>

      {userPosts.length > 0 ? (
        <div>
          {userPosts.map((post) => (
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
