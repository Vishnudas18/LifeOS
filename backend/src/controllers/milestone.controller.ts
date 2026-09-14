import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { MilestoneService } from "../services/milestone.service.js";
import {
  createMilestoneSchema,
  updateMilestoneSchema,
} from "../validators/milestone.validator.js";
import { sendSuccess } from "../utils/response.js";
import { z } from "zod";

const milestoneService = new MilestoneService();

export async function getMilestonesController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const goalId = req.params.goalId as string;
    const milestones = await milestoneService.getMilestones(userId, goalId);
    sendSuccess(res, { milestones }, "Milestones retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function createMilestoneController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const goalId = req.params.goalId as string;
    const input = createMilestoneSchema.parse(req.body);
    const milestone = await milestoneService.createMilestone(userId, goalId, input);
    sendSuccess(res, { milestone }, "Milestone created successfully", 201);
  } catch (error) {
    next(error);
  }
}

export async function updateMilestoneController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const goalId = req.params.goalId as string;
    const milestoneId = req.params.milestoneId as string;
    const input = updateMilestoneSchema.parse(req.body);
    const milestone = await milestoneService.updateMilestone(
      userId,
      goalId,
      milestoneId,
      input
    );
    sendSuccess(res, { milestone }, "Milestone updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function deleteMilestoneController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const goalId = req.params.goalId as string;
    const milestoneId = req.params.milestoneId as string;
    await milestoneService.deleteMilestone(userId, goalId, milestoneId);
    sendSuccess(res, null, "Milestone deleted successfully");
  } catch (error) {
    next(error);
  }
}

const associateTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  goalId: z.string().nullable().optional(),
  milestoneId: z.string().nullable().optional(),
});

export async function associateTaskController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { taskId, goalId, milestoneId } = associateTaskSchema.parse(req.body);
    const task = await milestoneService.associateTaskToGoal(
      userId,
      taskId,
      goalId,
      milestoneId
    );
    sendSuccess(res, { task }, "Task associated successfully");
  } catch (error) {
    next(error);
  }
}
