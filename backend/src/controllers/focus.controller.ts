import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { FocusService } from "../services/focus.service.js";
import {
  createFocusSessionSchema,
  focusQuerySchema,
  focusSummaryQuerySchema,
} from "../validators/focus.validator.js";
import { sendSuccess } from "../utils/response.js";

const focusService = new FocusService();

export async function startSessionController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const input = createFocusSessionSchema.parse(req.body);
    const session = await focusService.startSession(userId, input);
    sendSuccess(res, { session }, "Focus session started successfully", 201);
  } catch (error) {
    next(error);
  }
}

export async function getActiveSessionController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const session = await focusService.getActiveSession(userId);
    sendSuccess(
      res,
      { session },
      session
        ? "Active focus session retrieved successfully"
        : "No active focus session found"
    );
  } catch (error) {
    next(error);
  }
}

export async function getSessionByIdController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const sessionId = req.params.id as string;
    const session = await focusService.getSessionById(userId, sessionId);
    sendSuccess(res, { session }, "Focus session retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function pauseSessionController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const sessionId = req.params.id as string;
    const session = await focusService.pauseSession(userId, sessionId);
    sendSuccess(res, { session }, "Focus session paused successfully");
  } catch (error) {
    next(error);
  }
}

export async function resumeSessionController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const sessionId = req.params.id as string;
    const session = await focusService.resumeSession(userId, sessionId);
    sendSuccess(res, { session }, "Focus session resumed successfully");
  } catch (error) {
    next(error);
  }
}

export async function completeSessionController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const sessionId = req.params.id as string;
    const session = await focusService.completeSession(userId, sessionId);
    sendSuccess(res, { session }, "Focus session completed successfully");
  } catch (error) {
    next(error);
  }
}

export async function cancelSessionController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const sessionId = req.params.id as string;
    const session = await focusService.cancelSession(userId, sessionId);
    sendSuccess(res, { session }, "Focus session cancelled successfully");
  } catch (error) {
    next(error);
  }
}

export async function getSessionHistoryController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const queryInput = focusQuerySchema.parse(req.query);
    const { sessions, total } = await focusService.getSessionHistory(
      userId,
      queryInput
    );
    sendSuccess(
      res,
      { sessions, total, page: queryInput.page, limit: queryInput.limit },
      "Focus sessions history retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
}

export async function getFocusSummaryController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const rangeInput = focusSummaryQuerySchema.parse(req.query);
    const summary = await focusService.getFocusSummary(userId, rangeInput);
    sendSuccess(res, { summary }, "Focus summary retrieved successfully");
  } catch (error) {
    next(error);
  }
}
