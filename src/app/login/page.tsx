'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('メールアドレスまたはパスワードが正しくありません');
      return;
    }

    router.push('/timeline');
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-card shadow-card border border-parchment-dark p-8">
        <h1 className="text-3xl font-black text-center text-ink-deep tracking-tighter mb-1">Navilog</h1>
        <p className="text-center text-ink-light text-sm mb-8 tracking-wide">旅をシェアする</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && (
            <p className="text-coral text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ember hover:bg-ember-dark disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors tracking-wide"
            style={{ boxShadow: '0 4px 16px rgba(232,98,26,0.30)' }}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-light mt-6">
          アカウントをお持ちでない方は{' '}
          <Link href="/register" className="text-ember hover:underline font-medium">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
