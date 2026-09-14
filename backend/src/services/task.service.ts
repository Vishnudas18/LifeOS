import { Types } from "mongoose";
import { taskRepository, TaskFilterOptions, TaskPaginationOptions } from "../repositories/task.repository.js";
import { CreateTaskInput, UpdateTaskInput, TaskQueryInput, SubtaskInput } from "../validators/task.validator.js";
import { TaskStatus } from "../types/task.types.js";
import { Goal } from "../models/Goal.js";
import { Milestone } from "../models/Milestone.js";

export class TaskError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = "TaskError";
  }
}

async function validateRelatedGoalAndMilestoneOwnership(
  userId: string,
  goalId?: string | null,
  milestoneId?: string | null
) {
  const userObjId = new Types.ObjectId(userId);

  if (goalId) {
    if (!Types.ObjectId.isValid(goalId)) {
      throw new TaskError("Invalid Goal ID format", 400);
    }
    const goal = await Goal.findOne({
      _id: new Types.ObjectId(goalId),
      userId: userObjId,
    });
    if (!goal) {
      throw new TaskError("Goal not found or does not belong to you", 404);
    }
  }

  if (milestoneId) {
    if (!Types.ObjectId.isValid(milestoneId)) {
      throw new TaskError("Invalid Milestone ID format", 400);
    }
    const milestone = await Milestone.findOne({
      _id: new Types.ObjectId(milestoneId),
      userId: userObjId,
    });
    if (!milestone) {
      throw new TaskError("Milestone not found or does not belong to you", 404);
    }

    if (goalId && milestone.goalId.toString() !== goalId) {
      throw new TaskError("Milestone does not belong to the specified Goal", 400);
    }
  }
}

export async function getTasksService(userId: string, query: TaskQueryInput) {
  const filters: TaskFilterOptions = {
    status: query.status,
    priority: query.priority,
    category: query.category,
    search: query.search,
    dueDate: query.dueDate,
  };

  const pagination: TaskPaginationOptions = {
    page: query.page,
    limit: query.limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };

  const { tasks, total } = await taskRepository.findTasks(userId, filters, pagination);
  const totalPages = Math.ceil(total / query.limit) || 1;

  return {
    tasks,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
    },
  };
}

export async function getTaskByIdService(userId: string, taskId: string) {
  const task = await taskRepository.findById(userId, taskId);
  if (!task) {
    throw new TaskError("Task not found", 404);
  }
  return task;
}

export async function createTaskService(userId: string, input: CreateTaskInput) {
  await validateRelatedGoalAndMilestoneOwnership(userId, input.goalId, input.milestoneId);

  let completedAt: Date | null = null;
  if (input.status === TaskStatus.COMPLETED) {
    completedAt = new Date();
  }

  return taskRepository.create(userId, {
    ...input,
    completedAt: completedAt ? (completedAt.toISOString() as unknown as null) : null,
  } as unknown as CreateTaskInput);
}

export async function updateTaskService(userId: string, taskId: string, input: UpdateTaskInput) {
  const existingTask = await taskRepository.findById(userId, taskId);
  if (!existingTask) {
    throw new TaskError("Task not found", 404);
  }

  await validateRelatedGoalAndMilestoneOwnership(
    userId,
    input.goalId !== undefined ? input.goalId : existingTask.goalId?.toString(),
    input.milestoneId !== undefined ? input.milestoneId : existingTask.milestoneId?.toString()
  );

  const updateData: UpdateTaskInput & { completedAt?: Date | null } = { ...input };

  // Handle completion timestamp business logic
  if (input.status) {
    if (input.status === TaskStatus.COMPLETED && existingTask.status !== TaskStatus.COMPLETED) {
      updateData.completedAt = new Date();
    } else if (input.status !== TaskStatus.COMPLETED && existingTask.status === TaskStatus.COMPLETED) {
      updateData.completedAt = null;
    }
  }

  const updatedTask = await taskRepository.update(userId, taskId, updateData);
  if (!updatedTask) {
    throw new TaskError("Failed to update task", 400);
  }
  return updatedTask;
}

export async function updateTaskStatusService(userId: string, taskId: string, status: TaskStatus) {
  const existingTask = await taskRepository.findById(userId, taskId);
  if (!existingTask) {
    throw new TaskError("Task not found", 404);
  }

  let completedAt: Date | null | undefined = undefined;
  if (status === TaskStatus.COMPLETED && existingTask.status !== TaskStatus.COMPLETED) {
    completedAt = new Date();
  } else if (status !== TaskStatus.COMPLETED && existingTask.status === TaskStatus.COMPLETED) {
    completedAt = null;
  }

  const updateData: { status: TaskStatus; completedAt?: Date | null } = { status };
  if (completedAt !== undefined) {
    updateData.completedAt = completedAt;
  }

  const updatedTask = await taskRepository.update(userId, taskId, updateData);
  if (!updatedTask) {
    throw new TaskError("Failed to update task status", 400);
  }
  return updatedTask;
}

export async function deleteTaskService(userId: string, taskId: string) {
  const deleted = await taskRepository.delete(userId, taskId);
  if (!deleted) {
    throw new TaskError("Task not found or already deleted", 404);
  }
}

export async function addSubtaskService(userId: string, taskId: string, input: SubtaskInput) {
  const task = await taskRepository.addSubtask(userId, taskId, input);
  if (!task) {
    throw new TaskError("Task not found", 404);
  }
  return task;
}

export async function updateSubtaskService(
  userId: string,
  taskId: string,
  subtaskId: string,
  data: { title?: string; completed?: boolean }
) {
  const task = await taskRepository.updateSubtask(userId, taskId, subtaskId, data);
  if (!task) {
    throw new TaskError("Task or subtask not found", 404);
  }
  return task;
}

export async function deleteSubtaskService(userId: string, taskId: string, subtaskId: string) {
  const task = await taskRepository.deleteSubtask(userId, taskId, subtaskId);
  if (!task) {
    throw new TaskError("Task or subtask not found", 404);
  }
  return task;
}
