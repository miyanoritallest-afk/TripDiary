'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

type PhotoEntry = {
  file: File;
  previewUrl: string;
  uploadedUrl: string | null;
  uploadKey: string | null;
  pin: { locationName: string; lat: number; lng: number } | null;
};

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function PostCreateModal({ onClose, onSuccess }: Props) {
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [body, setBody] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (photos.length + files.length > 6) {
      setError('写真は最大6枚まです');
      return;
    }
    setError('');
    setUploading(true);

    const entries: PhotoEntry[] = files.map((f) => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
      uploadedUrl: null,
      uploadKey: null,
      pin: null,
    }));
    setPhotos((prev) => [...prev, ...entries]);

    const uploaded = await Promise.all(
      entries.map(async (entry) => {
        const fd = new FormData();
        fd.append('file', entry.file);
        const res = await fetch('/api/photos', { method: 'POST', body: fd });
        if (!res.ok) return { ...entry, uploadedUrl: null, uploadKey: null };
        const data = await res.json() as { url: string; key: string };
        return { ...entry, uploadedUrl: data.url, uploadKey: data.key };
      }),
    );

    setPhotos((prev) => {
      const updated = [...prev];
      for (let i = 0; i < uploaded.length; i++) {
        const idx = updated.findIndex((p) => p.previewUrl === uploaded[i].previewUrl);
        if (idx !== -1) updated[idx] = uploaded[i];
      }
      return updated;
    });
    setUploading(false);
    if (e.target) e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const addHashtag = () => {
    const tag = hashtagInput.replace(/^#/, '').trim();
    if (tag && !hashtags.includes(tag)) {
      setHashtags((prev) => [...prev, tag]);
    }
    setHashtagInput('');
  };

  const removeHashtag = (tag: string) => {
    setHashtags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      setError('写真を1枚以上追加してください');
      return;
    }
    if (uploading) {
      setError('写真のアップロード中です。しばらくお待ちください');
      return;
    }
    const failed = photos.filter((p) => p.uploadedUrl === null);
    if (failed.length > 0) {
      setError('アップロードに失敗した写真があります');
      return;
    }

    setSubmitting(true);
    setError('');

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body,
        hashtags,
        photos: photos.map((p, i) => ({
          imageUrl: p.uploadedUrl!,
          displayOrder: i + 1,
          ...(p.pin ? { pin: p.pin } : {}),
        })),
      }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json() as { error?: string };
      setError(data.error ?? '投稿に失敗しました');
      return;
    }

    onSuccess();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">キャンセル</button>
          <h2 className="text-sm font-bold text-gray-900">新しい投稿</h2>
          <button
            onClick={handleSubmit}
            disabled={submitting || uploading}
            className="text-sm font-medium text-blue-500 hover:text-blue-700 disabled:text-blue-300"
          >
            {submitting ? '投稿中...' : '投稿する'}
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-4">
          {/* 写真エリア */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">写真（最大6枚）</span>
              <span className="text-xs text-gray-400">{photos.length}/6</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <div key={p.previewUrl} className="relative w-20 h-20">
                  <Image
                    src={p.previewUrl}
                    alt={`写真${i + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  {p.uploadedUrl === null && (
                    <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">...</span>
                    </div>
                  )}
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800 text-white rounded-full text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}

              {photos.length < 6 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors"
                >
                  <span className="text-xl">+</span>
                  <span className="text-xs">追加</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* 本文 */}
          <div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="旅の感想を書こう..."
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          {/* ハッシュタグ */}
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                placeholder="#タグを追加"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
              <button
                onClick={addHashtag}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
              >
                追加
              </button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full"
                  >
                    #{tag}
                    <button onClick={() => removeHashtag(tag)} className="text-blue-400 hover:text-blue-600">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
      </div>
    </div>
  );
}
