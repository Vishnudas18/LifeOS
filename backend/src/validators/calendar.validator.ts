import { z } from "zod";
import {
  EventType,
  EventStatus,
  RecurrenceFrequency,
} from "../types/calendar.types.js";

const recurrenceConfigSchema = z.object({
  frequency: z.nativeEnum(RecurrenceFrequency),
  interval: z.number().int().min(1).optional().default(1),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional().default([]),
  until: z.string().datetime().nullable().optional(),
  count: z.number().int().min(1).nullable().optional(),
});

const reminderConfigSchema = z.object({
  enabled: z.boolean().default(false),
  minutesBefore: z.number().int().min(0).default(15),
  reminderType: z.string().optional().default("POPUP"),
});

export const baseCalendarEventSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),
  type: z
    .nativeEnum(EventType, { invalid_type_error: "Invalid event type" })
    .optional()
    .default(EventType.PERSONAL),
  startDateTime: z
    .string({ required_error: "Start date and time is required" })
    .datetime({ offset: true })
    .or(z.string().datetime()),
  endDateTime: z
    .string({ required_error: "End date and time is required" })
    .datetime({ offset: true })
    .or(z.string().datetime()),
  allDay: z.boolean().optional().default(false),
  timezone: z.string().trim().optional().default("Asia/Kolkata"),
  location: z.string().trim().max(300).optional().default(""),
  color: z.string().trim().nullable().optional(),
  status: z
    .nativeEnum(EventStatus, { invalid_type_error: "Invalid event status" })
    .optional()
    .default(EventStatus.SCHEDULED),
  taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Task ID").nullable().optional(),
  goalId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Goal ID").nullable().optional(),
  milestoneId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Milestone ID").nullable().optional(),
  recurrence: recurrenceConfigSchema.nullable().optional(),
  reminder: reminderConfigSchema.nullable().optional(),
});

export const createCalendarEventSchema = baseCalendarEventSchema.refine(
  (data) => new Date(data.endDateTime) >= new Date(data.startDateTime),
  {
    message: "End date and time cannot be before start date and time",
    path: ["endDateTime"],
  }
);

export const updateCalendarEventSchema = baseCalendarEventSchema.partial().refine(
  (data) => {
    if (data.startDateTime && data.endDateTime) {
      return new Date(data.endDateTime) >= new Date(data.startDateTime);
    }
    return true;
  },
  {
    message: "End date and time cannot be before start date and time",
    path: ["endDateTime"],
  }
);

export const calendarRangeQuerySchema = z.object({
  start: z
    .string({ required_error: "Start date is required for range query" })
    .datetime({ offset: true, message: "Invalid start date format" })
    .or(z.string().date()),
  end: z
    .string({ required_error: "End date is required for range query" })
    .datetime({ offset: true, message: "Invalid end date format" })
    .or(z.string().date()),
  type: z.nativeEnum(EventType).optional(),
  status: z.nativeEnum(EventStatus).optional(),
  search: z.string().trim().optional(),
});

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;
export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>;
export type CalendarRangeQueryInput = z.infer<typeof calendarRangeQuerySchema>;
