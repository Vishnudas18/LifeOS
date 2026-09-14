import rateLimit from "express-rate-limit";
import { sendError } from "../utils/response.js";
import { env } from "../config/env.js";

/**
 * Rate limiter for authentication routes (login, register, refresh)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  skip: () => env.NODE_ENV === "test",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      "Too many authentication attempts. Please try again later.",
      429
    );
  },
});

/**
 * Rate limiter for general API routes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  skip: () => env.NODE_ENV === "test",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      "Too many requests from this IP. Please try again later.",
      429
    );
  },
});

/**
 * Rate limiter for resource-intensive routes (global search, complex analytics)
 */
export const searchAnalyticsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  skip: () => env.NODE_ENV === "test",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      "Rate limit exceeded for search/analytics queries. Please wait a moment.",
      429
    );
  },
});
