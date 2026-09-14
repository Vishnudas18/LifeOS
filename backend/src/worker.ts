import mongoose from "mongoose";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import {
  startNotificationWorker,
  stopNotificationWorker,
} from "./jobs/workers/notification.worker.js";
import { getRedisConnection } from "./config/redis.js";

async function main() {
  logger.info("Starting Life OS Background Job Worker...");

  // 1. Connect to MongoDB Atlas
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info("Worker connected to MongoDB Atlas successfully");
  } catch (err) {
    logger.error({ err }, "Worker failed to connect to MongoDB Atlas");
    process.exit(1);
  }

  // 2. Initialize Redis connection
  const redis = getRedisConnection();

  // 3. Start Notification Worker
  const worker = startNotificationWorker();

  // 4. Graceful Shutdown Handlers
  const gracefulShutdown = async (signal: string) => {
    logger.info({ signal }, "Received shutdown signal. Initiating graceful worker shutdown...");

    try {
      await stopNotificationWorker();
      await redis.quit();
      await mongoose.disconnect();
      logger.info("Worker gracefully shut down. Exiting process.");
      process.exit(0);
    } catch (err) {
      logger.error({ err }, "Error during worker graceful shutdown");
      process.exit(1);
    }
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
}

main().catch((err) => {
  logger.error({ err }, "Unhandled error in worker process");
  process.exit(1);
});
