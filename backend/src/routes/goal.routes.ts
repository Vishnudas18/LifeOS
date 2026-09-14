import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getGoalsController,
  createGoalController,
  getGoalByIdController,
  updateGoalController,
  deleteGoalController,
} from "../controllers/goal.controller.js";
import {
  getMilestonesController,
  createMilestoneController,
  updateMilestoneController,
  deleteMilestoneController,
  associateTaskController,
} from "../controllers/milestone.controller.js";

const goalRouter = Router();

// Protect all goal routes with auth middleware
goalRouter.use(authenticate);

// Task association route
goalRouter.post("/associate-task", associateTaskController);

// Goal routes
goalRouter.get("/", getGoalsController);
goalRouter.post("/", createGoalController);
goalRouter.get("/:id", getGoalByIdController);
goalRouter.patch("/:id", updateGoalController);
goalRouter.delete("/:id", deleteGoalController);

// Milestone nested routes under goal
goalRouter.get("/:goalId/milestones", getMilestonesController);
goalRouter.post("/:goalId/milestones", createMilestoneController);
goalRouter.patch("/:goalId/milestones/:milestoneId", updateMilestoneController);
goalRouter.delete("/:goalId/milestones/:milestoneId", deleteMilestoneController);

export default goalRouter;
