'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('パスワードが一致しません');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? '登録に失敗しました');
      setLoading(false);
      return;
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('登録後のログインに失敗しました。ログイン画面からお試しください。');
      return;
    }

    router.push('/timeline');
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-card shadow-card border border-parchment-dark p-8">
        <h1 className="text-3xl font-black text-center text-ink-deep tracking-tighter mb-1">Navilog</h1>
        <p className="text-center text-ink-light text-sm mb-8 tracking-wide">旅人として登録する</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-mid mb-1">
              ユーザー名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border border-parchment-dark rounded-lg px-3 py-2 text-sm text-ink-deep focus:outline-none focus:ring-2 focus:ring-ember/40 focus:border-ember"
              placeholder="旅人たろう"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-mid mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-parchment-dark rounded-lg px-3 py-2 text-sm text-ink-deep focus:outline-none focus:ring-2 focus:ring-ember/40 focus:border-ember"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-mid mb-1">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-parchment-dark rounded-lg px-3 py-2 text-sm text-ink-deep focus:outline-none focus:ring-2 focus:ring-ember/40 focus:border-ember"
              placeholder="8文字以上"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-mid mb-1">
              パスワード（確認）
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full border border-parchment-dark rounded-lg px-3 py-2 text-sm text-ink-deep focus:outline-none focus:ring-2 focus:ring-ember/40 focus:border-ember"
              placeholder="もう一度入力"
            />
          </div>

          {error && (
            <p className="text-coral text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ember hover:bg-ember-dark disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors tracking-wide"
            style={{ boxShadow: '0 4px 16px rgba(232,98,26,0.30)' }}
          >
            {loading ? '登録中...' : 'アカウントを作成'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-light mt-6">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-ember hover:underline font-medium">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
