import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

// Helper function to sanitize connection string for logging
const sanitizeMongoUri = (uri: string): string => {
  try {
    return uri.replace(/\/\/(.*):(.*)@/, "//***:***@");
  } catch {
    return "MongoDB URI [redacted]";
  }
};

export async function connectDatabase(): Promise<void> {
  try {
    const sanitizedUri = sanitizeMongoUri(env.MONGODB_URI);
    logger.info(`Connecting to MongoDB (${sanitizedUri})...`);

    mongoose.connection.on("connected", () => {
      logger.info("MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      logger.error({ err }, "MongoDB connection error");
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    await mongoose.connect(env.MONGODB_URI);
  } catch (error) {
    logger.error({ error }, "Failed to connect to MongoDB Atlas");
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      logger.info("MongoDB connection closed");
    }
  } catch (error) {
    logger.error({ error }, "Error during MongoDB disconnection");
  }
}
