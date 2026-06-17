import rateLimit, { Options } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { getRedisClient, isRedisConnected } from "../../lib/redis";
import { logger } from "../../lib/logger";

function createStore(): RedisStore | undefined {
  const redis = getRedisClient();

  if (!redis || !isRedisConnected()) {
    logger.warn("Redis not available, using in-memory rate limit store");
    return undefined;
  }

  return new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args) as Promise<unknown>,
    prefix: "rl:",
  });
}

function createRateLimiter(options: Partial<Options>) {
  const store = createStore();
  
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    store,
    ...options,
  });
}

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many authentication attempts, please try again after 15 minutes" },
  skipSuccessfulRequests: false,
});

export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later" },
});

export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: { message: "API rate limit exceeded, please slow down" },
});

export const strictLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts for this operation, please try again later" },
});

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { message: "Upload limit exceeded, please try again later" },
});

export const webhookLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: { message: "Webhook rate limit exceeded" },
  skip: (req) => {
    const signature = req.headers["stripe-signature"];
    return !!signature;
  },
});
