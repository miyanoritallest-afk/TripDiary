import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RateLimiter } from '../rate-limiter';

describe('RateLimiter — sliding window', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter(3, 60_000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('上限まではリクエストを許可する', () => {
    expect(limiter.check('user-a').allowed).toBe(true);
    expect(limiter.check('user-a').allowed).toBe(true);
    expect(limiter.check('user-a').allowed).toBe(true);
  });

  it('上限+1 番目のリクエストをブロックする', () => {
    limiter.check('user-a');
    limiter.check('user-a');
    limiter.check('user-a');
    const result = limiter.check('user-a');
    expect(result.allowed).toBe(false);
  });

  it('ブロック時に正の retryAfterSeconds を返す', () => {
    limiter.check('user-a');
    limiter.check('user-a');
    limiter.check('user-a');
    const result = limiter.check('user-a');
    if (!result.allowed) {
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
      expect(result.retryAfterSeconds).toBeLessThanOrEqual(60);
    }
  });

  it('異なるユーザーのリクエストは独立している', () => {
    limiter.check('user-a');
    limiter.check('user-a');
    limiter.check('user-a');
    expect(limiter.check('user-b').allowed).toBe(true);
  });

  it('ウィンドウ経過後にリクエストが再び許可される', () => {
    vi.useFakeTimers();
    limiter.check('user-a');
    limiter.check('user-a');
    limiter.check('user-a');
    expect(limiter.check('user-a').allowed).toBe(false);

    vi.advanceTimersByTime(61_000);

    expect(limiter.check('user-a').allowed).toBe(true);
  });

  it('reset() で全状態がクリアされる', () => {
    limiter.check('user-a');
    limiter.check('user-a');
    limiter.check('user-a');
    limiter.reset();
    expect(limiter.check('user-a').allowed).toBe(true);
  });
});
