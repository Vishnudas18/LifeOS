import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { getRedisConnection } from "../config/redis.js";
import { sendSuccess, sendError } from "../utils/response.js";

const router = Router();

const getDatabaseStatus = (): string => {
  const state = mongoose.connection.readyState;
  switch (state) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    default:
      return "unknown";
  }
};

/**
 * Liveness Probe: Answers "Is the process running?"
 */
router.get("/health", (_req: Request, res: Response) => {
  sendSuccess(
    res,
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    "Life OS process is alive"
  );
});

/**
 * Readiness Probe: Answers "Can this instance serve API traffic?"
 */
router.get("/health/ready", async (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const isDbReady = dbState === 1;

  let isRedisReady = false;
  try {
    const redis = getRedisConnection();
    if (redis && redis.status === "ready") {
      await redis.ping();
      isRedisReady = true;
    }
  } catch {
    isRedisReady = false;
  }

  const isReady = isDbReady;

  const responseData = {
    status: isReady ? "ready" : "not_ready",
    services: {
      api: "ok",
      database: isDbReady ? "ok" : "degraded",
      redis: isRedisReady ? "ok" : "degraded",
    },
    timestamp: new Date().toISOString(),
  };

  if (!isReady) {
    sendError(res, "Service dependencies not ready", 503, responseData);
    return;
  }

  sendSuccess(res, responseData, "Life OS API is ready");
});

export default router;
