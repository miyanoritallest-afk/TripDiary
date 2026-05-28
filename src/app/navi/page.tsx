'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useNaviThread } from '@/contexts/NaviThreadContext';

function NaviContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { threads, createNewThread } = useNaviThread();
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowNewThreadModal(true);
      router.replace('/navi');
    }
  }, [searchParams, router]);

  const sortedThreads = [...threads].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleCreateThread = () => {
    if (!newTitle.trim()) return;
    const thread = createNewThread(newTitle.trim());
    setShowNewThreadModal(false);
    setNewTitle('');
    router.push(`/navi/${thread.id}`);
  };

  const formatDate = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}時間前`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}日前`;
    return new Date(iso).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <h1 className="text-lg font-bold text-gray-900">ナビちゃん</h1>
          </div>
          <button
            onClick={() => setShowNewThreadModal(true)}
            className="w-8 h-8 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            aria-label="新しい旅の相談を作成"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>

      {/* スレッド一覧 */}
      {sortedThreads.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {sortedThreads.map((thread) => {
            const lastMessage = thread.messages[thread.messages.length - 1];
            return (
              <button
                key={thread.id}
                onClick={() => router.push(`/navi/${thread.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-none bg-gray-100">
                  <Image
                    src={thread.thumbnailUrl}
                    alt={thread.title}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{thread.title}</p>
                    <span className="text-xs text-gray-400 flex-none">{formatDate(thread.updatedAt)}</span>
                  </div>
                  {lastMessage && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {lastMessage.role === 'navi' ? '🤖 ' : ''}
                      {lastMessage.content}
                    </p>
                  )}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-300 flex-none">
                  <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 px-8">
          <span className="text-5xl mb-4">✈️</span>
          <p className="text-base font-medium text-gray-500 mb-1">まだスレッドがありません</p>
          <p className="text-sm text-center">投稿の「行きたい！」を押すか、相談ボタンで旅の相談を始めよう！</p>
        </div>
      )}

      {/* 新規スレッド作成モーダル */}
      {showNewThreadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setShowNewThreadModal(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-bold text-gray-900 mb-1">新しい旅の相談</h2>
            <p className="text-xs text-gray-400 mb-4">どんな旅について相談したいですか？</p>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateThread()}
              placeholder="例: 北海道グルメ旅、ヨーロッパ周遊..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowNewThreadModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-600"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateThread}
                disabled={!newTitle.trim()}
                className="flex-1 py-3 rounded-xl bg-blue-500 text-white text-sm font-medium disabled:opacity-40"
              >
                相談を始める
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NaviPage() {
  return (
    <Suspense fallback={null}>
      <NaviContent />
    </Suspense>
  );
}
