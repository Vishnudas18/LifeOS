import { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: unknown;
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200
): Response {
  const responsePayload: ApiResponse<T> = {
    success: true,
  };

  if (message) {
    responsePayload.message = message;
  }

  if (data !== undefined) {
    responsePayload.data = data;
  }

  return res.status(statusCode).json(responsePayload);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errorDetails?: unknown
): Response {
  const responsePayload: ApiResponse = {
    success: false,
    message,
  };

  if (errorDetails && process.env.NODE_ENV === "development") {
    responsePayload.error = errorDetails;
  }

  return res.status(statusCode).json(responsePayload);
}
