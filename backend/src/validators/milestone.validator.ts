import { z } from "zod";
import { MilestoneStatus } from "../types/goal.types.js";

export const createMilestoneSchema = z.object({
  title: z
    .string({ required_error: "Milestone title is required" })
    .trim()
    .min(1, "Milestone title cannot be empty")
    .max(200, "Milestone title cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .default(""),
  status: z
    .nativeEnum(MilestoneStatus, {
      invalid_type_error: "Invalid status",
    })
    .optional()
    .default(MilestoneStatus.PENDING),
  dueDate: z.string().datetime({ offset: true }).or(z.string().date()).nullable().optional(),
  order: z.number().int().min(0).optional().default(0),
});

export const updateMilestoneSchema = createMilestoneSchema.partial();

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
