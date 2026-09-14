import Redis from "ioredis";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

let redisClient: Redis | null = null;
let isRedisAvailable = false;

export function getRedisConnection(): Redis {
  if (!redisClient) {
    const redisUrl = env.REDIS_URL || "redis://localhost:6379";

    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: false,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
    });

    redisClient.on("connect", () => {
      isRedisAvailable = true;
      logger.info({ redisUrl }, "Connected to Redis successfully");
    });

    redisClient.on("error", (err) => {
      isRedisAvailable = false;
      logger.warn({ err: err.message }, "Redis connection error");
    });
  }

  return redisClient;
}

export function checkIsRedisAvailable(): boolean {
  return isRedisAvailable && redisClient?.status === "ready";
}
