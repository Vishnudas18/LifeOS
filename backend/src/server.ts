import http from "node:http";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { createApp } from "./app.js";
import { logger } from "./utils/logger.js";

async function startServer(): Promise<void> {
  try {
    // 1. Initialize Express App
    const app = createApp();

    // 2. Connect to MongoDB Atlas (Server will NOT start if DB connection fails)
    await connectDatabase();

    // 3. Start HTTP Server
    const server = http.createServer(app);

    server.listen(env.PORT, () => {
      logger.info(
        `🚀 Life OS API running on port ${env.PORT} [${env.NODE_ENV}]`
      );
    });

    // 4. Graceful Shutdown Handlers
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);

      server.close(async () => {
        logger.info("HTTP server closed.");
        await disconnectDatabase();
        logger.info("Graceful shutdown completed.");
        process.exit(0);
      });

      // Force shutdown after 10 seconds if graceful shutdown deadlocks
      setTimeout(() => {
        logger.error("Forced shutdown due to timeout.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    logger.error({ error }, "Failed to start Life OS server");
    process.exit(1);
  }
}

startServer();
