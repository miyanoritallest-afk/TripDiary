'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Post } from '@/types';
import PhotoSwiper from './PhotoSwiper';
import LocationBadge from './LocationBadge';
import ActionButtons from './ActionButtons';

const PostMap = dynamic(() => import('@/components/map/PostMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[200px] bg-gray-100 animate-pulse" />,
});

type Props = {
  post: Post;
  onWantToGo: (post: Post) => void;
  onDelete?: (postId: string) => void;
};

export default function PostCard({ post, onWantToGo, onDelete }: Props) {
  const { data: session } = useSession();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = session?.user?.id === post.user.id;

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleDelete = async () => {
    if (!confirm('この投稿を削除しますか？')) return;
    setDeleting(true);
    setMenuOpen(false);
    const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
    if (res.ok) {
      onDelete?.(post.id);
    } else {
      alert('削除に失敗しました');
      setDeleting(false);
    }
  };

  // 現在の写真に対応するピンのlocationNameを取得
  const currentPin = post.photoPins.find((p) => p.photoIndex === currentPhotoIndex);
  const locationName = currentPin?.locationName ?? null;

  // 投稿日時を相対表示
  const formatDate = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return '今日';
    if (days === 1) return '1日前';
    if (days < 7) return `${days}日前`;
    return new Date(iso).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  return (
    <article className={`bg-white border-b border-gray-100 ${deleting ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* ユーザー情報 */}
      <div className="flex items-center gap-2.5 px-3 py-2">
        <Link href={`/user/${post.user.id}/posts`} className="flex items-center gap-2.5 flex-1 min-w-0 hover:bg-gray-50 transition-colors rounded-lg -mx-1 px-1">
          <div className="w-9 h-9 rounded-full overflow-hidden flex-none">
            <Image
              src={post.user.avatarUrl}
              alt={post.user.name}
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{post.user.name}</p>
            <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
          </div>
        </Link>
        {isOwner && (
          <div className="relative flex-none" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M3 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM8.5 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM15.5 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  投稿を削除
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 写真スワイプ */}
      <PhotoSwiper
        photoUrls={post.photoUrls}
        onPhotoChange={setCurrentPhotoIndex}
      />

      {/* 地名バッジ（写真切替に連動） */}
      <LocationBadge locationName={locationName} />

      {/* 本文 */}
      <div className="px-3 pt-2">
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{post.body}</p>
      </div>

      {/* ハッシュタグ */}
      {post.hashtags.length > 0 && (
        <div className="px-3 pt-1.5 flex flex-wrap gap-1">
          {post.hashtags.map((tag) => (
            <span key={tag} className="text-xs text-blue-500">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 地図ボタン＆地図表示 */}
      {post.photoPins.length > 0 && (
        <div>
          <button
            onClick={() => setShowMap((prev) => !prev)}
            className="flex items-center gap-1.5 mx-3 mb-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
            </svg>
            {showMap ? '地図を閉じる' : '地図を見る'}
          </button>
          {showMap && (
            <PostMap photoPins={post.photoPins} activePhotoIndex={currentPhotoIndex} />
          )}
        </div>
      )}

      {/* アクションボタン */}
      <ActionButtons post={post} onWantToGo={onWantToGo} />
    </article>
  );
}
