'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNaviThread } from '@/contexts/NaviThreadContext';

export default function ChatPage({ params }: { params: { threadId: string } }) {
  const { threadId } = params;
  const router = useRouter();
  const { threads, isStreaming, streamingThreadId, streamingContent, sendMessage, fetchThreads, deleteThread } =
    useNaviThread();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (threads.length === 0) {
      fetchThreads();
    }
  }, [threads.length, fetchThreads]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteThread(threadId);
      router.replace('/navi');
    } catch {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const thread = threads.find((t) => t.id === threadId);
  const isThisStreaming = isStreaming && streamingThreadId === threadId;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages, streamingContent, isThisStreaming]);

  const handleSend = async () => {
    if (!input.trim() || sending || isThisStreaming || !thread) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    try {
      await sendMessage(threadId, content);
    } finally {
      setSending(false);
    }
  };

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
        <p>スレッドが見つかりません</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-500 text-sm">
          戻る
        </button>
      </div>
    );
  }

  const isBusy = sending || isThisStreaming;

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center gap-3 px-3 h-12">
          <button
            onClick={() => router.back()}
            className="p-1 text-gray-400 hover:text-gray-600"
            aria-label="戻る"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg">🦜</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{thread.title}</p>
              <p className="text-xs text-gray-400">ナビちゃん</p>
            </div>
          </div>
          {/* ・・・メニュー */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              aria-label="メニュー"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M3 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM8.5 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM15.5 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <button
                  onClick={() => { setMenuOpen(false); setShowDeleteConfirm(true); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                  </svg>
                  スレッドを削除
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
          <div className="bg-white w-full max-w-sm rounded-2xl px-5 py-6 space-y-4">
            <p className="text-base font-semibold text-gray-900 text-center">スレッドを削除しますか？</p>
            <p className="text-sm text-gray-500 text-center">「{thread.title}」のすべての会話が削除されます。この操作は取り消せません。</p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full py-3 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-50"
              >
                {isDeleting ? '削除中...' : '削除する'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* メッセージ一覧 */}
      <div className="px-4 py-4 space-y-4" style={{ paddingBottom: '120px' }}>
        {thread.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {msg.role === 'navi' && (
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-none text-sm">
                🦜
              </div>
            )}
            <div
              className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* ストリーミング中のナビちゃん返答 */}
        {isThisStreaming && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-none text-sm">
              🦜
            </div>
            <div className="max-w-[75%] px-3.5 py-2.5 rounded-2xl rounded-bl-md text-sm leading-relaxed bg-white text-gray-800 shadow-sm border border-gray-100 whitespace-pre-wrap">
              {streamingContent || (
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 入力欄 */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 px-3 py-2 z-40">
        <div className="max-w-md mx-auto flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="メッセージを入力..."
            rows={1}
            disabled={isBusy}
            className="flex-1 border border-gray-300 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none leading-snug disabled:opacity-50"
            style={{ maxHeight: '100px', overflowY: 'auto' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isBusy}
            className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white disabled:opacity-40 flex-none transition-opacity"
            aria-label="送信"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.903 6.308a.75.75 0 0 0 .709.512h7.663a.75.75 0 0 1 0 1.5H4.89l-1.903 6.308a.75.75 0 0 0 .826.95 28.896 28.896 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.288Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
