import { z } from "zod";

function isValidIANATimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const updateSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),

  avatarUrl: z.string().url("Invalid avatar URL").nullable().optional(),

  preferences: z
    .object({
      timezone: z
        .string()
        .trim()
        .refine((val) => isValidIANATimezone(val), {
          message: "Invalid IANA timezone string (e.g. 'Asia/Kolkata', 'America/New_York')",
        })
        .optional(),

      locale: z.string().trim().min(2).max(10).optional(),

      currency: z
        .string()
        .trim()
        .length(3, "Currency code must be 3 characters")
        .transform((val) => val.toUpperCase())
        .optional(),

      dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]).optional(),

      timeFormat: z.enum(["12h", "24h"]).optional(),

      weekStartsOn: z.enum(["Monday", "Sunday"]).optional(),

      theme: z.enum(["light", "dark", "system"]).optional(),

      notifications: z
        .object({
          inApp: z.boolean().optional(),
          taskReminders: z.boolean().optional(),
          calendarReminders: z.boolean().optional(),
          goalReminders: z.boolean().optional(),
          focusCompletion: z.boolean().optional(),
        })
        .optional(),

      focus: z
        .object({
          defaultFocusMinutes: z.number().int().min(1).max(240).optional(),
          defaultShortBreakMinutes: z.number().int().min(1).max(60).optional(),
          defaultLongBreakMinutes: z.number().int().min(1).max(120).optional(),
          autoStartBreak: z.boolean().optional(),
        })
        .optional(),

      calendar: z
        .object({
          defaultView: z.enum(["month", "week", "day"]).optional(),
          defaultEventDuration: z.number().int().min(5).max(1440).optional(),
        })
        .optional(),
    })
    .optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
