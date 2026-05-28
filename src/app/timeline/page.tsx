'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { mockPosts } from '@/lib/mock/posts';
import PostCard from '@/components/post/PostCard';
import { useNaviThread } from '@/contexts/NaviThreadContext';
import { Post } from '@/types';

function TimelineContent() {
  const { addThreadFromPost } = useNaviThread();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('post') === '1') {
      setShowPostModal(true);
    }
  }, [searchParams]);

  const closeModal = () => {
    setShowPostModal(false);
    router.replace('/timeline');
  };

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
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 h-12">
          <h1 className="text-lg font-bold text-gray-900">TripDiary</h1>
        </div>
      </header>

      <div>
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post} onWantToGo={handleWantToGo} />
        ))}
      </div>

      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={closeModal}>
          <div className="w-full max-w-md bg-white rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-bold text-gray-900 mb-1">新しい投稿</h2>
            <p className="text-xs text-gray-400 mb-4">写真と旅の思い出を共有しよう</p>
            <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm mb-4">
              📷 写真を追加（プロトタイプ）
            </div>
            <textarea
              placeholder="旅の感想を書こう..."
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-600">
                キャンセル
              </button>
              <button onClick={closeModal} className="flex-1 py-3 rounded-xl bg-blue-500 text-white text-sm font-medium">
                投稿する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TimelinePage() {
  return (
    <Suspense fallback={null}>
      <TimelineContent />
    </Suspense>
  );
}
