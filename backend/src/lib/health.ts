import mongoose from "mongoose";
import { getRedisClient, isRedisConnected } from "./redis";
import { logger } from "./logger";

export interface HealthCheckResult {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  uptime: number;
  checks: {
    [key: string]: {
      status: "pass" | "fail" | "warn";
      responseTime?: number;
      message?: string;
    };
  };
}

export interface LivenessResult {
  status: "alive";
  timestamp: string;
}

export interface ReadinessResult {
  status: "ready" | "not_ready";
  timestamp: string;
  checks: {
    mongodb: { status: "pass" | "fail"; message?: string };
    redis: { status: "pass" | "fail" | "skip"; message?: string };
  };
}

const startTime = Date.now();

export function getUptime(): number {
  return Math.floor((Date.now() - startTime) / 1000);
}

export async function checkMongoDB(): Promise<{
  status: "pass" | "fail";
  responseTime: number;
  message?: string;
}> {
  const start = Date.now();

  try {
    const state = mongoose.connection.readyState;

    if (state !== 1) {
      return {
        status: "fail",
        responseTime: Date.now() - start,
        message: `MongoDB not connected (state: ${state})`,
      };
    }

    await mongoose.connection.db?.admin().ping();

    return {
      status: "pass",
      responseTime: Date.now() - start,
    };
  } catch (err) {
    logger.error({ err }, "MongoDB health check failed");
    return {
      status: "fail",
      responseTime: Date.now() - start,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function checkRedis(): Promise<{
  status: "pass" | "fail" | "skip";
  responseTime: number;
  message?: string;
}> {
  const start = Date.now();
  const redis = getRedisClient();

  if (!redis) {
    return {
      status: "skip",
      responseTime: Date.now() - start,
      message: "Redis not configured",
    };
  }

  try {
    if (!isRedisConnected()) {
      return {
        status: "fail",
        responseTime: Date.now() - start,
        message: "Redis not connected",
      };
    }

    await redis.ping();

    return {
      status: "pass",
      responseTime: Date.now() - start,
    };
  } catch (err) {
    logger.error({ err }, "Redis health check failed");
    return {
      status: "fail",
      responseTime: Date.now() - start,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function getHealthStatus(): Promise<HealthCheckResult> {
  const [mongoCheck, redisCheck] = await Promise.all([
    checkMongoDB(),
    checkRedis(),
  ]);

  const allPassed = mongoCheck.status === "pass" &&
    (redisCheck.status === "pass" || redisCheck.status === "skip");

  const hasCriticalFailure = mongoCheck.status === "fail";
  const hasWarning = redisCheck.status === "fail";

  let status: "healthy" | "unhealthy" | "degraded";
  if (hasCriticalFailure) {
    status = "unhealthy";
  } else if (hasWarning) {
    status = "degraded";
  } else {
    status = "healthy";
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    uptime: getUptime(),
    checks: {
      mongodb: mongoCheck,
      redis: redisCheck,
    },
  };
}

export async function getReadinessStatus(): Promise<ReadinessResult> {
  const [mongoCheck, redisCheck] = await Promise.all([
    checkMongoDB(),
    checkRedis(),
  ]);

  const isReady = mongoCheck.status === "pass";

  return {
    status: isReady ? "ready" : "not_ready",
    timestamp: new Date().toISOString(),
    checks: {
      mongodb: {
        status: mongoCheck.status,
        message: mongoCheck.message,
      },
      redis: {
        status: redisCheck.status,
        message: redisCheck.message,
      },
    },
  };
}

export function getLivenessStatus(): LivenessResult {
  return {
    status: "alive",
    timestamp: new Date().toISOString(),
  };
}
