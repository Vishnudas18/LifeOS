import { z } from "zod";
import {
  TaskStatus,
  TaskPriority,
  RecurrenceFrequency,
} from "../types/task.types.js";

export const subtaskSchema = z.object({
  title: z
    .string({ required_error: "Subtask title is required" })
    .trim()
    .min(1, "Subtask title cannot be empty"),
  completed: z.boolean().optional().default(false),
});

export const recurrenceSchema = z.object({
  frequency: z.nativeEnum(RecurrenceFrequency),
  interval: z.number().int().min(1).default(1),
});

export const createTaskSchema = z.object({
  goalId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Goal ID").nullable().optional(),
  milestoneId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Milestone ID").nullable().optional(),
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title cannot exceed 200 characters"),
  description: z.string().trim().optional(),
  status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.MEDIUM),
  category: z.string().trim().optional().default("Personal"),
  tags: z.array(z.string().trim()).optional().default([]),
  dueDate: z.string().datetime().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  subtasks: z.array(subtaskSchema).optional().default([]),
  isRecurring: z.boolean().optional().default(false),
  recurrence: recurrenceSchema.nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus, {
    required_error: "Status is required",
    invalid_type_error: "Invalid task status value",
  }),
});

export const taskQuerySchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
  dueDate: z.string().optional(),
  goalId: z.string().optional(),
  milestoneId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "dueDate", "priority", "title", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
export type SubtaskInput = z.infer<typeof subtaskSchema>;
