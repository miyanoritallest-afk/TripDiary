'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import type { NaviThread, Post } from '@/types';

type NaviThreadContextType = {
  threads: NaviThread[];
  isLoading: boolean;
  streamingThreadId: string | null;
  streamingContent: string | null;
  isStreaming: boolean;
  fetchThreads: () => Promise<void>;
  addThreadFromPost: (post: Post) => Promise<NaviThread>;
  createNewThread: (title: string) => Promise<NaviThread>;
  sendMessage: (threadId: string, content: string) => Promise<void>;
};

const NaviThreadContext = createContext<NaviThreadContextType | null>(null);

export function NaviThreadProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<NaviThread[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingThreadId, setStreamingThreadId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/navi/threads');
      if (res.ok) {
        const data = await res.json() as NaviThread[];
        setThreads(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addThreadFromPost = async (post: Post): Promise<NaviThread> => {
    const locationName = post.photoPins[0]?.locationName ?? post.hashtags[0] ?? '旅先';
    const initialContext = `${post.user.name}さんの「${locationName}」への投稿を見て気になりました！この場所への旅行を計画したいです。`;

    const res = await fetch('/api/navi/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `${locationName}の旅プラン`,
        sourcePostId: post.id,
        thumbnailUrl: post.photoUrls[0],
        initialContext,
      }),
    });

    if (!res.ok) throw new Error('Failed to create thread');
    const thread = await res.json() as NaviThread;
    setThreads((prev) => [thread, ...prev]);
    return thread;
  };

  const createNewThread = async (title: string): Promise<NaviThread> => {
    const res = await fetch('/api/navi/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) throw new Error('Failed to create thread');
    const thread = await res.json() as NaviThread;
    setThreads((prev) => [thread, ...prev]);
    return thread;
  };

  const sendMessage = async (threadId: string, content: string): Promise<void> => {
    const tempUserMsgId = `temp_user_${Date.now()}`;
    const userMessage = {
      id: tempUserMsgId,
      role: 'user' as const,
      content,
      createdAt: new Date().toISOString(),
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, messages: [...t.messages, userMessage], updatedAt: new Date().toISOString() }
          : t,
      ),
    );

    setStreamingThreadId(threadId);
    setStreamingContent('');
    setIsStreaming(true);

    const res = await fetch(`/api/navi/threads/${threadId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!res.ok || !res.body) {
      setIsStreaming(false);
      setStreamingThreadId(null);
      setStreamingContent(null);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr) as
              | { type: 'delta'; content: string }
              | { type: 'done'; messageId: string }
              | { type: 'error'; message: string };

            if (event.type === 'delta') {
              accumulated += event.content;
              setStreamingContent(accumulated);
            } else if (event.type === 'done') {
              // streamingContent をスレッドの確定メッセージに移動（追加ではなく置き換え）
              const naviMessage = {
                id: event.messageId,
                role: 'navi' as const,
                content: accumulated,
                createdAt: new Date().toISOString(),
              };
              setThreads((prev) =>
                prev.map((t) => {
                  if (t.id !== threadId) return t;
                  // temp_navi_ があれば置き換え、なければ追加
                  const hasTempNavi = t.messages.some((m) => m.id.startsWith('temp_navi_'));
                  if (hasTempNavi) {
                    return {
                      ...t,
                      messages: t.messages.map((m) =>
                        m.id.startsWith('temp_navi_') ? naviMessage : m,
                      ),
                      updatedAt: new Date().toISOString(),
                    };
                  }
                  return {
                    ...t,
                    messages: [...t.messages, naviMessage],
                    updatedAt: new Date().toISOString(),
                  };
                }),
              );
            }
          } catch {
            // malformed JSON line — skip
          }
        }
      }
    } finally {
      setIsStreaming(false);
      setStreamingThreadId(null);
      setStreamingContent(null);
    }
  };

  return (
    <NaviThreadContext.Provider
      value={{
        threads,
        isLoading,
        streamingThreadId,
        streamingContent,
        isStreaming,
        fetchThreads,
        addThreadFromPost,
        createNewThread,
        sendMessage,
      }}
    >
      {children}
    </NaviThreadContext.Provider>
  );
}

export function useNaviThread() {
  const ctx = useContext(NaviThreadContext);
  if (!ctx) throw new Error('useNaviThread must be used within NaviThreadProvider');
  return ctx;
}
