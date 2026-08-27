import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * In-Memory Sliding Window Rate Limiter
 * Provides DDoS, brute-force, and resource exhaustion protection
 */
export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) {
  const store = new Map<string, RateLimitRecord>();
  const { windowMs, max, message = 'Too many requests. Please slow down.' } = options;

  // Periodic cleanup every 5 minutes to prevent memory leak
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetAt) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = options.keyGenerator 
      ? options.keyGenerator(req) 
      : (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'ip-default');

    const now = Date.now();
    const existing = store.get(key);

    if (!existing || now > existing.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      return next();
    }

    if (existing.count >= max) {
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('Retry-After', Math.ceil((existing.resetAt - now) / 1000));
      return res.status(429).json({
        error: message,
        retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
      });
    }

    existing.count += 1;
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - existing.count);
    next();
  };
}

// Specialized rate limiters for high-risk operations
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 attempts per minute per IP
  message: 'Too many authentication attempts. Please wait 1 minute before trying again.',
});

export const aiCopilotRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 40, // 40 AI queries per minute
  message: 'AI Copilot query limit reached. Please wait a moment before sending more requests.',
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 file uploads per minute
  message: 'Document upload rate limit exceeded. Please wait 1 minute.',
});

export const generalApiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 240, // 240 requests per minute
  message: 'API rate limit exceeded. Please throttle your requests.',
});
