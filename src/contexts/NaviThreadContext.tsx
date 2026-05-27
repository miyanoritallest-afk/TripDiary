'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { NaviThread, Post, ChatMessage } from '@/types';
import { mockThreads } from '@/lib/mock/threads';

const NAVI_DUMMY_REPLIES = [
  'いいですね！いつ頃の旅行を考えていますか？✈️',
  'そのルートいいね！まず〇〇に行って、次に□□がおすすめだよ〜',
  '予算はどのくらいを考えていますか？💰',
  '現地のおすすめグルメも教えますよ！何か食べたいものある？🍜',
  'そのエリアなら電車より車がおすすめかも！レンタカーも安いよ🚗',
  '紅葉シーズンに行くなら早めに宿を予約しておいた方がいいよ！🍂',
  'いい選択！現地の穴場スポットも教えようか？🗺️',
  'わかった！もう少し詳しく教えてくれたら、より具体的なプランを立てられるよ😊',
];

type NaviThreadContextType = {
  threads: NaviThread[];
  addThreadFromPost: (post: Post) => NaviThread;
  createNewThread: (title: string) => NaviThread;
  sendMessage: (threadId: string, content: string) => void;
};

const NaviThreadContext = createContext<NaviThreadContextType | null>(null);

export function NaviThreadProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<NaviThread[]>(mockThreads);

  const addThreadFromPost = (post: Post): NaviThread => {
    const locationName = post.photoPins[0]?.locationName ?? post.hashtags[0] ?? '旅先';
    const newThread: NaviThread = {
      id: `thread_${Date.now()}`,
      title: `${locationName}の旅プラン`,
      thumbnailUrl: post.photoUrls[0],
      sourcePostId: post.id,
      messages: [
        {
          id: `msg_${Date.now()}`,
          role: 'navi',
          content: `${post.user.name}さんの${locationName}の投稿、気になったんだね！✈️ どんな旅にしたい？ひとり？誰かと一緒？`,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setThreads((prev) => [newThread, ...prev]);
    return newThread;
  };

  const createNewThread = (title: string): NaviThread => {
    const newThread: NaviThread = {
      id: `thread_${Date.now()}`,
      title,
      thumbnailUrl: 'https://picsum.photos/seed/new/400/400',
      sourcePostId: undefined,
      messages: [
        {
          id: `msg_${Date.now()}`,
          role: 'navi',
          content: '新しい旅の相談だね！どこ行きたいの？✈️',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setThreads((prev) => [newThread, ...prev]);
    return newThread;
  };

  const sendMessage = (threadId: string, content: string) => {
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, messages: [...t.messages, userMessage], updatedAt: new Date().toISOString() }
          : t
      )
    );

    // 500ms後にナビちゃんのダミー返答を追加
    setTimeout(() => {
      const naviReply = NAVI_DUMMY_REPLIES[Math.floor(Math.random() * NAVI_DUMMY_REPLIES.length)];
      const naviMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'navi',
        content: naviReply,
        createdAt: new Date().toISOString(),
      };
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? { ...t, messages: [...t.messages, naviMessage], updatedAt: new Date().toISOString() }
            : t
        )
      );
    }, 500);
  };

  return (
    <NaviThreadContext.Provider value={{ threads, addThreadFromPost, createNewThread, sendMessage }}>
      {children}
    </NaviThreadContext.Provider>
  );
}

export function useNaviThread() {
  const ctx = useContext(NaviThreadContext);
  if (!ctx) throw new Error('useNaviThread must be used within NaviThreadProvider');
  return ctx;
}
