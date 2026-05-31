/**
 * Navilog — Navi SSE エンドポイントテスト (k6)
 *
 * 目的: ナビちゃんの SSE ストリーミングエンドポイントのレスポンスタイムと正確性を計測する。
 *
 * 注意: k6 は EventSource (SSE) のネイティブサポートがないため、
 *       http.post() でレスポンス全体を受け取り、SSE フォーマットを検証する方式を採用する。
 *
 * 前提条件: THREAD_ID に既存のナビスレッド ID を設定すること。
 *   例) THREAD_ID=$(curl -s -b "next-auth.session-token=..." http://localhost:3000/api/navi/threads | jq -r '.[0].id')
 *
 * k6 インストール:
 *   macOS   : brew install k6
 *   Windows : choco install k6  または  winget install k6
 *
 * 実行:
 *   THREAD_ID=<uuid> k6 run k6/navi-sse.js
 *   THREAD_ID=<uuid> BASE_URL=http://your-ec2-ip:3000 k6 run k6/navi-sse.js
 *
 * Claude API コスト節約のため VU=2、反復回数=5 に制限している。
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:3000';
const EMAIL = __ENV.E2E_EMAIL || 'e2e-test@example.com';
const PASSWORD = __ENV.E2E_PASSWORD || 'e2ePassword123';
const THREAD_ID = __ENV.THREAD_ID || '';

export const options = {
  vus: 2,
  iterations: 5,
  timeout: '120s',
  thresholds: {
    // ナビちゃんは Claude API のストリームを含むため p(95) < 10 秒
    http_req_duration: ['p(95)<10000'],
    http_req_failed: ['rate<0.1'],
  },
};

export function setup() {
  if (!THREAD_ID) {
    console.warn('THREAD_ID が未設定です。スレッドを事前に作成し、THREAD_ID=<uuid> を指定してください。');
  }

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

  return { sessionCookie: cookie, threadId: THREAD_ID };
}

export default function (data) {
  if (!data.threadId) {
    console.error('THREAD_ID が設定されていないためスキップします');
    return;
  }

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Cookie: `next-auth.session-token=${data.sessionCookie}`,
    },
    timeout: '60s',
  };

  const body = JSON.stringify({ content: '東京旅行でおすすめの観光スポットを教えて' });
  const url = `${BASE}/api/navi/threads/${data.threadId}/messages`;

  const res = http.post(url, body, params);

  check(res, {
    'SSE エンドポイント 200': (r) => r.status === 200,
    'Content-Type が text/event-stream': (r) =>
      (r.headers['Content-Type'] || '').includes('text/event-stream'),
    'レスポンスボディが SSE data: で始まる': (r) =>
      (r.body || '').toString().startsWith('data:'),
    'done イベントが含まれる': (r) =>
      (r.body || '').toString().includes('"type":"done"'),
    'レートリミット 429 が発生しない': (r) => r.status !== 429,
  });

  // Claude API コストと 1 分 10 回制限を考慮して長めにスリープ
  sleep(15);
}
