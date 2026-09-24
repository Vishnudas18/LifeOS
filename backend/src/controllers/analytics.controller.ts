import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { AnalyticsService } from "../services/analytics.service.js";
import {
  dashboardDateRangeQuerySchema,
  dateRangeQuerySchema,
} from "../validators/analytics.validator.js";
import { sendSuccess } from "../utils/response.js";

const analyticsService = new AnalyticsService();

export async function getDashboardController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { todayStart, monthStart } = dashboardDateRangeQuerySchema.parse(req.query);
    const data = await analyticsService.getDashboard(userId, todayStart, monthStart);
    sendSuccess(res, data, "Dashboard data retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function getOverviewController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { start, end } = dateRangeQuerySchema.parse(req.query);
    const data = await analyticsService.getOverview(userId, start, end);
    sendSuccess(res, data, "Analytics overview retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function getProductivityAnalyticsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { start, end } = dateRangeQuerySchema.parse(req.query);
    const data = await analyticsService.getProductivityAnalytics(userId, start, end);
    sendSuccess(res, data, "Productivity analytics retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function getFinancialAnalyticsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { start, end } = dateRangeQuerySchema.parse(req.query);
    const data = await analyticsService.getFinancialAnalytics(userId, start, end);
    sendSuccess(res, data, "Financial analytics retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function getGoalAnalyticsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { start, end } = dateRangeQuerySchema.parse(req.query);
    const data = await analyticsService.getGoalAnalytics(userId, start, end);
    sendSuccess(res, data, "Goal analytics retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function getFocusAnalyticsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { start, end } = dateRangeQuerySchema.parse(req.query);
    const data = await analyticsService.getFocusAnalytics(userId, start, end);
    sendSuccess(res, data, "Focus analytics retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function getCalendarAnalyticsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { start, end } = dateRangeQuerySchema.parse(req.query);
    const data = await analyticsService.getCalendarAnalytics(userId, start, end);
    sendSuccess(res, data, "Calendar analytics retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function getInsightsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { start, end } = dateRangeQuerySchema.parse(req.query);
    const data = await analyticsService.getInsights(userId, start, end);
    sendSuccess(res, data, "Analytics insights retrieved successfully");
  } catch (error) {
    next(error);
  }
}
