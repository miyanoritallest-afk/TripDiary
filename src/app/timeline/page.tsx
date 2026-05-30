'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import PostCard from '@/components/post/PostCard';
import PostCreateModal from '@/components/post/PostCreateModal';
import { useNaviThread } from '@/contexts/NaviThreadContext';
import type { Post } from '@/types';

function TimelineContent() {
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
    const params = new URLSearchParams({ type: 'all', limit: '20' });
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
    router.replace('/timeline');
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

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleWantToGo = async (post: Post) => {
    await addThreadFromPost(post);
    const toast = document.createElement('div');
    toast.textContent = '✈️ ナビちゃんにスレッドを追加したよ！';
    toast.style.cssText = `
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
      background: #1B6B6E; color: white; padding: 10px 20px; border-radius: 24px;
      font-size: 13px; z-index: 9999; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  return (
    <div>
      <header className="sticky top-0 bg-white border-b border-parchment-dark z-40">
        <div className="flex items-center justify-between px-4 h-12">
          <h1 className="text-xl font-black text-ink-deep" style={{ fontFamily: 'var(--font-zen-maru)' }}>Navilog</h1>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 text-sm">読み込み中...</div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-4xl mb-3">📷</span>
          <p className="text-sm">まだ投稿がありません</p>
        </div>
      ) : (
        <>
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onWantToGo={handleWantToGo} onDelete={handleDeletePost} />
            ))}
          </div>
          {nextCursor && (
            <div className="flex justify-center py-6">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2 text-sm text-ember border border-ember/40 rounded-full hover:bg-ember-glow disabled:opacity-50 tracking-wide"
              >
                {loadingMore ? '読み込み中...' : 'もっと見る'}
              </button>
            </div>
          )}
        </>
      )}

      {showPostModal && (
        <PostCreateModal onClose={closeModal} onSuccess={handlePostSuccess} />
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
