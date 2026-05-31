/**
 * Navilog — Smoke Test (k6)
 *
 * 目的: 主要エンドポイントが正しく応答するかを 1 VU で素早く確認する。
 * 所要時間: 約 30 秒
 *
 * k6 インストール:
 *   macOS   : brew install k6
 *   Windows : choco install k6  または  winget install k6
 *   Linux   : https://k6.io/docs/get-started/installation/
 *
 * 実行:
 *   k6 run k6/smoke.js
 *   E2E_EMAIL=you@example.com E2E_PASSWORD=yourpass k6 run k6/smoke.js
 *   BASE_URL=http://your-ec2-ip:3000 k6 run k6/smoke.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:3000';
const EMAIL = __ENV.E2E_EMAIL || 'e2e-test@example.com';
const PASSWORD = __ENV.E2E_PASSWORD || 'e2ePassword123';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export function setup() {
  const csrfRes = http.get(`${BASE}/api/auth/csrf`);
  check(csrfRes, { 'CSRF endpoint 200': (r) => r.status === 200 });

  const { csrfToken } = JSON.parse(csrfRes.body);

  const loginRes = http.post(
    `${BASE}/api/auth/callback/credentials`,
    { csrfToken, email: EMAIL, password: PASSWORD },
    { redirects: 0 },
  );

  const cookie =
    (loginRes.cookies['next-auth.session-token'] ?? [])[0]?.value ??
    (loginRes.cookies['__Secure-next-auth.session-token'] ?? [])[0]?.value;

  if (!cookie) {
    console.error('ログイン失敗 — E2E_EMAIL / E2E_PASSWORD を確認してください');
  }

  return { sessionCookie: cookie };
}

export default function (data) {
  const params = {
    headers: {
      Cookie: `next-auth.session-token=${data.sessionCookie}`,
    },
  };

  // GET /api/posts
  const postsRes = http.get(`${BASE}/api/posts?type=all&limit=10`, params);
  check(postsRes, {
    'GET /api/posts 200': (r) => r.status === 200,
    'posts レスポンスに posts キーが存在する': (r) => {
      try { return JSON.parse(r.body).posts !== undefined; } catch { return false; }
    },
  });

  sleep(1);

  // GET /api/navi/threads
  const threadsRes = http.get(`${BASE}/api/navi/threads`, params);
  check(threadsRes, {
    'GET /api/navi/threads 200': (r) => r.status === 200,
  });

  sleep(1);
}
