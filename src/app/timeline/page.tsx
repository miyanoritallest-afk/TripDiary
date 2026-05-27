'use client';

import { mockPosts } from '@/lib/mock/posts';
import PostCard from '@/components/post/PostCard';
import { useNaviThread } from '@/contexts/NaviThreadContext';
import { Post } from '@/types';

export default function TimelinePage() {
  const { addThreadFromPost } = useNaviThread();

  const handleWantToGo = (post: Post) => {
    addThreadFromPost(post);
    // トースト的な通知（簡易版）
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
          <h1 className="text-lg font-bold text-gray-900">TripDiary</h1>
          <span className="text-xl">🗺️</span>
        </div>
      </header>

      {/* 投稿一覧 */}
      <div>
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post} onWantToGo={handleWantToGo} />
        ))}
      </div>
    </div>
  );
}
