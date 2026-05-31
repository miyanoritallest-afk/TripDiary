import { RateLimiter } from './rate-limiter';

export const naviMessageLimiter = new RateLimiter(10, 60_000);
export const naviThreadLimiter = new RateLimiter(5, 10 * 60_000);
