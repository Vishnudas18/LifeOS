import { AuditLog } from "../models/AuditLog.js";
import { logger } from "../utils/logger.js";

export interface LogAuditOptions {
  userId?: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  status: "SUCCESS" | "FAILURE" | "ALERT";
  details?: Record<string, any>;
}

export async function logAuditEvent(options: LogAuditOptions): Promise<void> {
  try {
    await AuditLog.create({
      userId: options.userId,
      action: options.action,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      status: options.status,
      details: options.details,
    });
  } catch (error) {
    logger.warn({ error, action: options.action }, "Failed to write audit log entry");
  }
}
