import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
  subtaskSchema,
} from "../validators/task.validator.js";
import {
  getTasksService,
  getTaskByIdService,
  createTaskService,
  updateTaskService,
  updateTaskStatusService,
  deleteTaskService,
  addSubtaskService,
  updateSubtaskService,
  deleteSubtaskService,
} from "../services/task.service.js";
import { sendSuccess } from "../utils/response.js";

export async function getTasksController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const queryInput = taskQuerySchema.parse(req.query);
    const result = await getTasksService(userId, queryInput);
    sendSuccess(res, result, "Tasks retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function getTaskByIdController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const taskId = req.params.id as string;
    const task = await getTaskByIdService(userId, taskId);
    sendSuccess(res, { task }, "Task details retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function createTaskController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const input = createTaskSchema.parse(req.body);
    const task = await createTaskService(userId, input);
    sendSuccess(res, { task }, "Task created successfully", 201);
  } catch (error) {
    next(error);
  }
}

export async function updateTaskController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const taskId = req.params.id as string;
    const input = updateTaskSchema.parse(req.body);
    const task = await updateTaskService(userId, taskId, input);
    sendSuccess(res, { task }, "Task updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateTaskStatusController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const taskId = req.params.id as string;
    const { status } = updateTaskStatusSchema.parse(req.body);
    const task = await updateTaskStatusService(userId, taskId, status);
    sendSuccess(res, { task }, "Task status updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function deleteTaskController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const taskId = req.params.id as string;
    await deleteTaskService(userId, taskId);
    sendSuccess(res, null, "Task deleted successfully");
  } catch (error) {
    next(error);
  }
}

export async function addSubtaskController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const taskId = req.params.id as string;
    const input = subtaskSchema.parse(req.body);
    const task = await addSubtaskService(userId, taskId, input);
    sendSuccess(res, { task }, "Subtask added successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateSubtaskController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const taskId = req.params.id as string;
    const subtaskId = req.params.subtaskId as string;
    const task = await updateSubtaskService(userId, taskId, subtaskId, req.body);
    sendSuccess(res, { task }, "Subtask updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function deleteSubtaskController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const taskId = req.params.id as string;
    const subtaskId = req.params.subtaskId as string;
    const task = await deleteSubtaskService(userId, taskId, subtaskId);
    sendSuccess(res, { task }, "Subtask deleted successfully");
  } catch (error) {
    next(error);
  }
}
