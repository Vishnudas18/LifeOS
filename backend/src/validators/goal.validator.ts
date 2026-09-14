import { z } from "zod";
import {
  GoalStatus,
  GoalPriority,
  GoalCategory,
} from "../types/goal.types.js";

export const baseGoalSchema = z.object({
  title: z
    .string({ required_error: "Goal title is required" })
    .trim()
    .min(1, "Goal title cannot be empty")
    .max(200, "Goal title cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional()
    .default(""),
  category: z
    .nativeEnum(GoalCategory, {
      required_error: "Category is required",
      invalid_type_error: "Invalid category",
    })
    .default(GoalCategory.PERSONAL),
  status: z
    .nativeEnum(GoalStatus, {
      invalid_type_error: "Invalid status",
    })
    .optional()
    .default(GoalStatus.NOT_STARTED),
  priority: z
    .nativeEnum(GoalPriority, {
      invalid_type_error: "Invalid priority",
    })
    .optional()
    .default(GoalPriority.MEDIUM),
  startDate: z.string().datetime({ offset: true }).or(z.string().date()).nullable().optional(),
  targetDate: z.string().datetime({ offset: true }).or(z.string().date()).nullable().optional(),
  progress: z
    .number()
    .min(0, "Progress must be at least 0")
    .max(100, "Progress cannot exceed 100")
    .optional()
    .default(0),
  color: z.string().trim().nullable().optional(),
  icon: z.string().trim().nullable().optional(),
});

export const createGoalSchema = baseGoalSchema.refine(
  (data) => {
    if (data.startDate && data.targetDate) {
      return new Date(data.targetDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: "Target date cannot be before start date",
    path: ["targetDate"],
  }
);

export const updateGoalSchema = baseGoalSchema.partial().refine(
  (data) => {
    if (data.startDate && data.targetDate) {
      return new Date(data.targetDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: "Target date cannot be before start date",
    path: ["targetDate"],
  }
);

export const goalQuerySchema = z.object({
  status: z.nativeEnum(GoalStatus).optional(),
  category: z.nativeEnum(GoalCategory).optional(),
  priority: z.nativeEnum(GoalPriority).optional(),
  search: z.string().trim().optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(["createdAt", "targetDate", "priority", "title", "progress", "status"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type GoalQueryInput = z.infer<typeof goalQuerySchema>;
