'use client';

import { useState } from 'react';
import { Post } from '@/types';

type Props = {
  post: Post;
  onWantToGo: (post: Post) => void;
};

export default function ActionButtons({ post, onWantToGo }: Props) {
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [wantToGo, setWantToGo] = useState(post.isWantToGo);
  const [wantToGoCount, setWantToGoCount] = useState(post.wantToGoCount);

  const handleLike = async () => {
    // 楽観的UI: 先にUIを更新してからAPIを呼ぶ
    const next = !liked;
    setLiked(next);
    setLikeCount((prev) => (next ? prev + 1 : prev - 1));

    try {
      const res = await fetch(`/api/posts/${post.id}/likes`, {
        method: next ? 'POST' : 'DELETE',
      });
      if (res.ok) {
        const data = await res.json() as { likeCount: number };
        setLikeCount(data.likeCount);
      } else {
        // 失敗時はロールバック
        setLiked(!next);
        setLikeCount((prev) => (next ? prev - 1 : prev + 1));
      }
    } catch {
      setLiked(!next);
      setLikeCount((prev) => (next ? prev - 1 : prev + 1));
    }
  };

  const handleWantToGo = async () => {
    const next = !wantToGo;
    setWantToGo(next);
    setWantToGoCount((prev) => (next ? prev + 1 : prev - 1));

    if (next) onWantToGo(post);

    try {
      const res = await fetch(`/api/posts/${post.id}/want-to-go`, {
        method: next ? 'POST' : 'DELETE',
      });
      if (res.ok) {
        const data = await res.json() as { wantToGoCount: number };
        setWantToGoCount(data.wantToGoCount);
      } else {
        setWantToGo(!next);
        setWantToGoCount((prev) => (next ? prev - 1 : prev + 1));
      }
    } catch {
      setWantToGo(!next);
      setWantToGoCount((prev) => (next ? prev - 1 : prev + 1));
    }
  };

  return (
    <div className="px-3 py-2 flex items-center gap-4">
      {/* いいねボタン */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-all ${
          liked
            ? 'bg-red-50 border-red-400 text-red-500'
            : 'bg-white border-gray-300 text-gray-600'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={liked ? 0 : 1.5}
          className="w-5 h-5 transition-colors"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
        <span className="font-medium">{likeCount}</span>
      </button>

      {/* 行きたい！ボタン */}
      <button
        onClick={handleWantToGo}
        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-all ${
          wantToGo
            ? 'bg-blue-500 border-blue-500 text-white'
            : 'bg-white border-gray-300 text-gray-600'
        }`}
      >
        <span>✈️</span>
        <span className="font-medium">{wantToGo ? '行きたい！✓' : '行きたい！'}</span>
        <span className={`text-xs ${wantToGo ? 'text-blue-100' : 'text-gray-400'}`}>
          {wantToGoCount}
        </span>
      </button>
    </div>
  );
}
