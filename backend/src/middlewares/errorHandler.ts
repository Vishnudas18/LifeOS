import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { sendError } from "../utils/response.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";
import { AuthError } from "../services/auth.service.js";
import { TaskError } from "../services/task.service.js";
import { TransactionError } from "../services/transaction.service.js";
import { GoalError } from "../services/goal.service.js";
import { MilestoneError } from "../services/milestone.service.js";
import { CalendarError } from "../services/calendar.service.js";
import { FocusError } from "../services/focus.service.js";
import { AnalyticsError } from "../services/analytics.service.js";
import { NotificationError } from "../services/notification.service.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle Custom Errors with statusCode
  if (
    err instanceof AuthError ||
    err instanceof TaskError ||
    err instanceof TransactionError ||
    err instanceof GoalError ||
    err instanceof MilestoneError ||
    err instanceof CalendarError ||
    err instanceof FocusError ||
    err instanceof AnalyticsError ||
    err instanceof NotificationError ||
    (err as any).statusCode
  ) {
    const statusCode = (err as any).statusCode || 400;
    sendError(res, err.message, statusCode);
    return;
  }

  logger.error({ err }, "Unhandled application error");

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const issueMessages = err.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    sendError(res, `Validation error: ${issueMessages}`, 400, err.issues);
    return;
  }

  // Handle Mongoose Validation Errors
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    sendError(res, `Database validation error: ${messages}`, 400);
    return;
  }

  // Handle Mongoose Cast Errors (Invalid ObjectIDs)
  if (err instanceof mongoose.Error.CastError) {
    sendError(res, `Invalid ID format: ${err.value}`, 400);
    return;
  }

  // Generic internal server error
  const message =
    env.NODE_ENV === "production" ? "Internal server error" : err.message;
  sendError(res, message, 500);
}
