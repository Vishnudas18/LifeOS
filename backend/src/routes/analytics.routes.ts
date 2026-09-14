import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getOverviewController,
  getProductivityAnalyticsController,
  getFinancialAnalyticsController,
  getGoalAnalyticsController,
  getFocusAnalyticsController,
  getCalendarAnalyticsController,
  getInsightsController,
} from "../controllers/analytics.controller.js";

import { searchAnalyticsLimiter } from "../middlewares/rateLimiter.js";

const analyticsRouter = Router();

// Protect all analytics endpoints with authentication and rate limiting middleware
analyticsRouter.use(authenticate);
analyticsRouter.use(searchAnalyticsLimiter);

analyticsRouter.get("/overview", getOverviewController);
analyticsRouter.get("/productivity", getProductivityAnalyticsController);
analyticsRouter.get("/financial", getFinancialAnalyticsController);
analyticsRouter.get("/goals", getGoalAnalyticsController);
analyticsRouter.get("/focus", getFocusAnalyticsController);
analyticsRouter.get("/calendar", getCalendarAnalyticsController);
analyticsRouter.get("/insights", getInsightsController);

export default analyticsRouter;
