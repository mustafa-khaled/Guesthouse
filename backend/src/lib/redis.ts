import Redis from "ioredis";
import { env } from "../config/env";
import { logger } from "./logger";

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!env.REDIS_URL) {
    return null;
  }

  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          logger.error("Redis connection failed after 3 retries");
          return null;
        }
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
      lazyConnect: true,
    });

    redis.on("connect", () => {
      logger.info("Redis connected");
    });

    redis.on("error", (err) => {
      logger.error({ err }, "Redis error");
    });

    redis.on("close", () => {
      logger.info("Redis connection closed");
    });
  }

  return redis;
}

export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  if (client) {
    try {
      await client.connect();
    } catch (err) {
      logger.warn({ err }, "Redis connection failed, caching disabled");
    }
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

export function isRedisConnected(): boolean {
  return redis?.status === "ready";
}
