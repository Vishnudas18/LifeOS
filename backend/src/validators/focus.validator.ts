import { z } from "zod";
import { FocusMode, FocusStatus } from "../types/focus.types.js";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createFocusSessionSchema = z.object({
  title: z
    .string()
    .trim()
    .max(200, "Title cannot exceed 200 characters")
    .optional()
    .default("Focus Session"),
  mode: z
    .nativeEnum(FocusMode, { invalid_type_error: "Invalid focus mode" })
    .optional()
    .default(FocusMode.FOCUS),
  plannedDuration: z
    .number({ required_error: "Planned duration is required" })
    .int("Duration must be an integer")
    .min(1, "Planned duration must be at least 1 second")
    .max(86400, "Planned duration cannot exceed 24 hours (86400 seconds)"),
  taskId: z
    .string()
    .regex(objectIdRegex, "Invalid Task ID")
    .nullable()
    .optional(),
  goalId: z
    .string()
    .regex(objectIdRegex, "Invalid Goal ID")
    .nullable()
    .optional(),
  milestoneId: z
    .string()
    .regex(objectIdRegex, "Invalid Milestone ID")
    .nullable()
    .optional(),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional(),
});

export const focusQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  mode: z.nativeEnum(FocusMode).optional(),
  status: z.nativeEnum(FocusStatus).optional(),
  taskId: z.string().regex(objectIdRegex).optional(),
  goalId: z.string().regex(objectIdRegex).optional(),
});

export const focusSummaryQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateFocusSessionSchemaInput = z.infer<
  typeof createFocusSessionSchema
>;
export type FocusQuerySchemaInput = z.infer<typeof focusQuerySchema>;
export type FocusSummaryQuerySchemaInput = z.infer<
  typeof focusSummaryQuerySchema
>;
