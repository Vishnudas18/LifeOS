import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  startSessionController,
  getActiveSessionController,
  getSessionByIdController,
  pauseSessionController,
  resumeSessionController,
  completeSessionController,
  cancelSessionController,
  getSessionHistoryController,
  getFocusSummaryController,
} from "../controllers/focus.controller.js";

const focusRouter = Router();

// Protect all focus timer endpoints with authentication middleware
focusRouter.use(authenticate);

// Focus Summary endpoint
focusRouter.get("/summary", getFocusSummaryController);

// Session endpoints
focusRouter.post("/sessions", startSessionController);
focusRouter.get("/sessions", getSessionHistoryController);
focusRouter.get("/sessions/active", getActiveSessionController);
focusRouter.get("/sessions/:id", getSessionByIdController);
focusRouter.post("/sessions/:id/pause", pauseSessionController);
focusRouter.post("/sessions/:id/resume", resumeSessionController);
focusRouter.post("/sessions/:id/complete", completeSessionController);
focusRouter.post("/sessions/:id/cancel", cancelSessionController);

export default focusRouter;
