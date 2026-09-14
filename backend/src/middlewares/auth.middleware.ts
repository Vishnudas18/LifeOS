import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { sendError } from "../utils/response.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, "Unauthorized: Access token missing", 401);
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
    };
    next();
  } catch {
    sendError(res, "Unauthorized: Invalid or expired access token", 401);
  }
}
