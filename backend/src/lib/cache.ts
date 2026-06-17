import { getRedisClient, isRedisConnected } from "./redis";
import { logger } from "./logger";

export const CacheTTL = {
  PROPERTY: 30 * 60,
  RATE_PLAN: 30 * 60,
  ROOM_TYPE: 15 * 60,
  INVENTORY: 5 * 60,
  SHORT: 60,
} as const;

export const CachePrefix = {
  PROPERTY: "property",
  PROPERTY_LIST: "property:list",
  RATE_PLAN: "ratePlan",
  RATE_PLANS_BY_ROOM: "ratePlans:room",
  ROOM_TYPE: "roomType",
  ROOM_TYPES_BY_PROPERTY: "roomTypes:property",
  INVENTORY: "inventory",
} as const;

export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = CacheTTL.SHORT
): Promise<T> {
  const redis = getRedisClient();

  if (!redis || !isRedisConnected()) {
    return fetcher();
  }

  try {
    const cached = await redis.get(key);
    if (cached) {
      logger.debug({ key }, "Cache hit");
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    logger.warn({ err, key }, "Cache read error");
  }

  const data = await fetcher();

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
    logger.debug({ key, ttl: ttlSeconds }, "Cache set");
  } catch (err) {
    logger.warn({ err, key }, "Cache write error");
  }

  return data;
}

export async function invalidate(pattern: string): Promise<void> {
  const redis = getRedisClient();

  if (!redis || !isRedisConnected()) {
    return;
  }

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.debug({ pattern, count: keys.length }, "Cache invalidated");
    }
  } catch (err) {
    logger.warn({ err, pattern }, "Cache invalidation error");
  }
}

export async function invalidateKey(key: string): Promise<void> {
  const redis = getRedisClient();

  if (!redis || !isRedisConnected()) {
    return;
  }

  try {
    await redis.del(key);
    logger.debug({ key }, "Cache key deleted");
  } catch (err) {
    logger.warn({ err, key }, "Cache delete error");
  }
}

export async function invalidateMultiple(keys: string[]): Promise<void> {
  const redis = getRedisClient();

  if (!redis || !isRedisConnected() || keys.length === 0) {
    return;
  }

  try {
    await redis.del(...keys);
    logger.debug({ keys }, "Cache keys deleted");
  } catch (err) {
    logger.warn({ err, keys }, "Cache delete error");
  }
}

export function buildCacheKey(...parts: (string | number)[]): string {
  return parts.join(":");
}
