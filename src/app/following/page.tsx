'use client';

import { mockPosts } from '@/lib/mock/posts';
import PostCard from '@/components/post/PostCard';
import { useNaviThread } from '@/contexts/NaviThreadContext';
import { Post } from '@/types';

export default function FollowingPage() {
  const { addThreadFromPost } = useNaviThread();

  // フォロー中のユーザーの投稿のみフィルタリング
  const followingPosts = mockPosts.filter((post) => post.user.isFollowing);

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

  return (
    <div>
      {/* ヘッダー */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 h-12">
          <h1 className="text-lg font-bold text-gray-900">フォロー中</h1>
          <span className="text-sm text-gray-400">{followingPosts.length}件</span>
        </div>
      </header>

      {/* 投稿一覧 */}
      {followingPosts.length > 0 ? (
        <div>
          {followingPosts.map((post) => (
            <PostCard key={post.id} post={post} onWantToGo={handleWantToGo} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-4xl mb-3">👥</span>
          <p className="text-sm">フォロー中のユーザーの投稿がありません</p>
        </div>
      )}
    </div>
  );
}
