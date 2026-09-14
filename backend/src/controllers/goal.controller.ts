import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { GoalService } from "../services/goal.service.js";
import {
  createGoalSchema,
  updateGoalSchema,
  goalQuerySchema,
} from "../validators/goal.validator.js";
import { sendSuccess } from "../utils/response.js";

const goalService = new GoalService();

export async function getGoalsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const queryInput = goalQuerySchema.parse(req.query);
    const result = await goalService.getGoals(userId, queryInput);
    sendSuccess(res, result, "Goals retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function createGoalController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const input = createGoalSchema.parse(req.body);
    const goal = await goalService.createGoal(userId, input);
    sendSuccess(res, { goal }, "Goal created successfully", 201);
  } catch (error) {
    next(error);
  }
}

export async function getGoalByIdController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const goalId = req.params.id as string;
    const details = await goalService.getGoalDetails(userId, goalId);
    sendSuccess(res, details, "Goal details retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateGoalController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const goalId = req.params.id as string;
    const input = updateGoalSchema.parse(req.body);
    const goal = await goalService.updateGoal(userId, goalId, input);
    sendSuccess(res, { goal }, "Goal updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function deleteGoalController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const goalId = req.params.id as string;
    await goalService.deleteGoal(userId, goalId);
    sendSuccess(res, null, "Goal deleted successfully");
  } catch (error) {
    next(error);
  }
}
