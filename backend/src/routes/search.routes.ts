import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { searchController } from "../controllers/search.controller.js";
import { searchAnalyticsLimiter } from "../middlewares/rateLimiter.js";

const searchRouter = Router();

// Protect search route with authentication middleware
searchRouter.use(authenticate);

searchRouter.get("/", searchAnalyticsLimiter, searchController);

export default searchRouter;
