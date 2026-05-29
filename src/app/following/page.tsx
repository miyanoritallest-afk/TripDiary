'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import PostCard from '@/components/post/PostCard';
import PostCreateModal from '@/components/post/PostCreateModal';
import { useNaviThread } from '@/contexts/NaviThreadContext';
import { Post } from '@/types';

function FollowingContent() {
  const { addThreadFromPost } = useNaviThread();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPostModal, setShowPostModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (searchParams.get('post') === '1') {
      setShowPostModal(true);
    }
  }, [searchParams]);

  const fetchPosts = useCallback(async (cursor?: string) => {
    const params = new URLSearchParams({ type: 'following', limit: '20' });
    if (cursor) params.set('cursor', cursor);
    const res = await fetch(`/api/posts?${params}`);
    if (!res.ok) return;
    const data = await res.json() as { posts: Post[]; nextCursor: string | null };
    return data;
  }, []);

  useEffect(() => {
    fetchPosts().then((data) => {
      if (data) {
        setPosts(data.posts);
        setNextCursor(data.nextCursor);
      }
      setLoading(false);
    });
  }, [fetchPosts]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    const data = await fetchPosts(nextCursor);
    if (data) {
      setPosts((prev) => [...prev, ...data.posts]);
      setNextCursor(data.nextCursor);
    }
    setLoadingMore(false);
  };

  const closeModal = () => {
    setShowPostModal(false);
    router.replace('/following');
  };

  const handlePostSuccess = async () => {
    closeModal();
    setLoading(true);
    const data = await fetchPosts();
    if (data) {
      setPosts(data.posts);
      setNextCursor(data.nextCursor);
    }
    setLoading(false);
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

  return (
    <div>
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 h-12">
          <h1 className="text-lg font-bold text-gray-900">TripDiary</h1>
        </div>
      </header>

      {showPostModal && (
        <PostCreateModal onClose={closeModal} onSuccess={handlePostSuccess} />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 text-sm">読み込み中...</div>
      ) : posts.length > 0 ? (
        <>
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onWantToGo={handleWantToGo} />
            ))}
          </div>
          {nextCursor && (
            <div className="flex justify-center py-6">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2 text-sm text-blue-500 border border-blue-300 rounded-full hover:bg-blue-50 disabled:opacity-50"
              >
                {loadingMore ? '読み込み中...' : 'もっと見る'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-4xl mb-3">👥</span>
          <p className="text-sm">フォロー中のユーザーの投稿がありません</p>
        </div>
      )}
    </div>
  );
}

export default function FollowingPage() {
  return (
    <Suspense fallback={null}>
      <FollowingContent />
    </Suspense>
  );
}
