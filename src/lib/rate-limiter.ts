export class RateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly store = new Map<string, number[]>();

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    const timer = setInterval(() => this.cleanup(), windowMs * 10);
    if (timer.unref) timer.unref();
  }

  check(userId: string): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const timestamps = (this.store.get(userId) ?? []).filter((t) => t > windowStart);

    if (timestamps.length >= this.maxRequests) {
      const retryAfterMs = timestamps[0] + this.windowMs - now;
      return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
    }

    timestamps.push(now);
    this.store.set(userId, timestamps);
    return { allowed: true };
  }

  reset(): void {
    this.store.clear();
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.windowMs;
    this.store.forEach((ts, userId) => {
      const fresh = ts.filter((t) => t > cutoff);
      if (fresh.length === 0) this.store.delete(userId);
      else this.store.set(userId, fresh);
    });
  }
}
