'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import type { Post, User } from '@/types';

type ProfileData = User & {
  bio: string | null;
  postCount: number;
  followerCount: number;
  followingCount: number;
};

type UserListItem = User;

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userListModal, setUserListModal] = useState<'followers' | 'following' | null>(null);
  const [userList, setUserList] = useState<UserListItem[]>([]);
  const [userListLoading, setUserListLoading] = useState(false);

  // プロフィール編集モーダル
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editAvatarUploading, setEditAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const openEdit = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditBio(profile.bio ?? '');
    setEditAvatarUrl(profile.avatarUrl);
    setEditOpen(true);
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditAvatarUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/photos', { method: 'POST', body: fd });
    if (res.ok) {
      const data = await res.json() as { url: string };
      setEditAvatarUrl(data.url);
    }
    setEditAvatarUploading(false);
    if (e.target) e.target.value = '';
  };

  const handleEditSave = async () => {
    if (!profile || !session?.user?.id) return;
    setEditSaving(true);
    const res = await fetch(`/api/profiles/${session.user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: editName.trim(), bio: editBio.trim(), avatarUrl: editAvatarUrl }),
    });
    if (res.ok) {
      const updated = await res.json() as ProfileData;
      setProfile(updated);
      setEditOpen(false);
    }
    setEditSaving(false);
  };

  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;

    Promise.all([
      fetch(`/api/profiles/${userId}`).then((r) => r.json()) as Promise<ProfileData>,
      fetch(`/api/posts?type=all&limit=50`).then((r) => r.json()) as Promise<{ posts: Post[] }>,
    ]).then(([profileData, postsData]) => {
      setProfile(profileData);
      setPosts(postsData.posts.filter((p) => p.user.id === userId));
      setLoading(false);
    });
  }, [session]);

  const openUserList = async (type: 'followers' | 'following') => {
    if (!profile) return;
    setUserListModal(type);
    setUserList([]);
    setUserListLoading(true);
    const res = await fetch(`/api/profiles/${profile.id}/${type}`);
    if (res.ok) {
      const data = await res.json() as UserListItem[];
      setUserList(data);
    }
    setUserListLoading(false);
  };

  const handleFollow = async (targetId: string, currentlyFollowing: boolean) => {
    const method = currentlyFollowing ? 'DELETE' : 'POST';
    const url = currentlyFollowing ? `/api/follows/${targetId}` : '/api/follows';
    const body = currentlyFollowing ? undefined : JSON.stringify({ followingId: targetId });

    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body,
    });
    if (res.ok) {
      setUserList((prev) =>
        prev.map((u) => u.id === targetId ? { ...u, isFollowing: !currentlyFollowing } : u),
      );
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
        読み込み中...
      </div>
    );
  }

  return (
    <div>
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 h-12">
          <h1 className="text-lg font-bold text-ink-deep" style={{ fontFamily: 'var(--font-zen-maru)' }}>プロフィール</h1>
          <button
            onClick={openEdit}
            className="text-sm text-blue-500 font-medium hover:text-blue-700"
          >
            編集
          </button>
        </div>
      </header>

      {/* プロフィール情報 */}
      <div className="bg-white px-4 py-6 flex flex-col items-center gap-3 border-b border-gray-100">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
          <Image
            src={profile.avatarUrl}
            alt={profile.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">{profile.name}</p>
          <p className="text-sm text-gray-400 mt-0.5">@{profile.id.slice(0, 8)}</p>
          {profile.bio && (
            <p className="text-sm text-gray-500 mt-2 max-w-xs leading-relaxed">{profile.bio}</p>
          )}
        </div>
        <div className="flex gap-10 mt-2">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">{profile.postCount}</p>
            <p className="text-sm text-gray-500 mt-0.5">投稿</p>
          </div>
          <button className="text-center" onClick={() => openUserList('followers')}>
            <p className="text-xl font-bold text-gray-900">{profile.followerCount}</p>
            <p className="text-sm text-gray-500 mt-0.5">フォロワー</p>
          </button>
          <button className="text-center" onClick={() => openUserList('following')}>
            <p className="text-xl font-bold text-gray-900">{profile.followingCount}</p>
            <p className="text-sm text-gray-500 mt-0.5">フォロー中</p>
          </button>
        </div>
      </div>

      {/* 投稿グリッド */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5 bg-gray-100">
          {posts.map((post) => (
            <Link key={post.id} href={`/user/${profile.id}/posts?postId=${post.id}`} className="aspect-square overflow-hidden bg-gray-200 block">
              <Image
                src={post.photoUrls[0]}
                alt={post.body.slice(0, 20)}
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-4xl mb-3">📷</span>
          <p className="text-sm">まだ投稿がありません</p>
        </div>
      )}

      {/* プロフィール編集モーダル */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onMouseDown={() => setEditOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <button onClick={() => setEditOpen(false)} className="text-sm text-gray-400 hover:text-gray-600">キャンセル</button>
              <h2 className="text-sm font-bold text-gray-900">プロフィールを編集</h2>
              <button
                onClick={handleEditSave}
                disabled={editSaving || editAvatarUploading}
                className="text-sm font-medium text-blue-500 hover:text-blue-700 disabled:text-blue-300"
              >
                {editSaving ? '保存中...' : '保存'}
              </button>
            </div>
            <div className="px-4 py-5 space-y-4">
              {/* アイコン変更 */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                  <Image src={editAvatarUrl} alt="アイコン" fill className="object-cover" />
                  {editAvatarUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-xs">...</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="text-xs text-blue-500 font-medium hover:text-blue-700"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    avatarInputRef.current?.click();
                  }}
                >
                  アイコンを変更
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarFileChange}
                  style={{ display: 'none' }}
                />
              </div>
              {/* 名前 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">名前</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              {/* bio */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">自己紹介</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  placeholder="旅好きの自己紹介を書こう..."
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* フォロワー/フォロー中モーダル */}
      {userListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setUserListModal(null)}>
          <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">
                {userListModal === 'followers' ? 'フォロワー' : 'フォロー中'}
              </h2>
              <button onClick={() => setUserListModal(null)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {userListLoading ? (
                <div className="flex items-center justify-center py-10 text-gray-400 text-sm">読み込み中...</div>
              ) : userList.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
                  {userListModal === 'followers' ? 'フォロワーはいません' : 'フォロー中のユーザーはいません'}
                </div>
              ) : (
                userList.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 px-4 py-3">
                    <Link href={`/user/${user.id}/posts`} onClick={() => setUserListModal(null)} className="w-10 h-10 rounded-full overflow-hidden flex-none bg-gray-100">
                      <Image src={user.avatarUrl} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/user/${user.id}/posts`} onClick={() => setUserListModal(null)}>
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      </Link>
                    </div>
                    {user.id !== session?.user?.id && (
                      <button
                        onClick={() => handleFollow(user.id, user.isFollowing)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                          user.isFollowing
                            ? 'border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500'
                            : 'border-blue-400 text-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        {user.isFollowing ? 'フォロー中' : 'フォロー'}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
