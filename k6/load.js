/**
 * Navilog — Load Test (k6)
 *
 * 目的: タイムライン系エンドポイントの持続的な負荷に対するレスポンスタイムを計測する。
 * 構成: 30 秒でランプアップ → 90 秒ホールド（10 VU）→ 30 秒でランプダウン
 * しきい値: 通常 API p(95) < 500ms
 *
 * k6 インストール:
 *   macOS   : brew install k6
 *   Windows : choco install k6  または  winget install k6
 *
 * 実行:
 *   k6 run k6/load.js
 *   BASE_URL=http://your-ec2-ip:3000 E2E_EMAIL=... E2E_PASSWORD=... k6 run k6/load.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const BASE = __ENV.BASE_URL || 'http://localhost:3000';
const EMAIL = __ENV.E2E_EMAIL || 'e2e-test@example.com';
const PASSWORD = __ENV.E2E_PASSWORD || 'e2ePassword123';

const postsLatency = new Trend('navilog_posts_latency_ms');

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '90s', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    navilog_posts_latency_ms: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],
  },
};

export function setup() {
  const csrfRes = http.get(`${BASE}/api/auth/csrf`);
  const { csrfToken } = JSON.parse(csrfRes.body);

  const loginRes = http.post(
    `${BASE}/api/auth/callback/credentials`,
    { csrfToken, email: EMAIL, password: PASSWORD },
    { redirects: 0 },
  );

  const cookie =
    (loginRes.cookies['next-auth.session-token'] ?? [])[0]?.value ??
    (loginRes.cookies['__Secure-next-auth.session-token'] ?? [])[0]?.value;

  return { sessionCookie: cookie };
}

export default function (data) {
  const params = {
    headers: { Cookie: `next-auth.session-token=${data.sessionCookie}` },
  };

  const start = Date.now();
  const postsRes = http.get(`${BASE}/api/posts?type=all&limit=20`, params);
  postsLatency.add(Date.now() - start);

  check(postsRes, {
    'posts 200': (r) => r.status === 200,
  });

  // 実ユーザーに近い 1〜3 秒のシンクタイム
  sleep(Math.random() * 2 + 1);
}
