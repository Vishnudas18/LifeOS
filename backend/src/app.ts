import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import apiRouter from "./routes/index.js";
import swaggerRouter from "./docs/openapi.js";
import { generalLimiter } from "./middlewares/rateLimiter.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

export function createApp(): Application {
  const app: Application = express();

  // Security Headers using Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allowed for Vite dev & UI charts
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
          connectSrc: ["'self'", env.CLIENT_URL, "ws:", "wss:"],
          frameAncestors: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: env.NODE_ENV === "production" ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      xFrameOptions: { action: "deny" },
      xContentTypeOptions: true,
    })
  );

  // CORS configuration allowing defined origins
  const allowedOrigins = [env.CLIENT_URL, "http://localhost:5173", "http://localhost:3000"].filter(
    Boolean
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || env.NODE_ENV === "development") {
          return callback(null, true);
        }
        return callback(new Error("CORS policy violation: Origin not allowed"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );

  // Request Body & Cookie Parsers with reasonable size limits
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(cookieParser());

  // General Rate Limiter
  app.use("/api/v1", generalLimiter);

  // HTTP Request Logging
  app.use(
    pinoHttp({
      logger,
      autoLogging: env.NODE_ENV !== "test",
    })
  );

  // OpenAPI Documentation
  app.use("/api/v1", swaggerRouter);

  // API v1 Routing Base
  app.use("/api/v1", apiRouter);

  // 404 & Global Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
