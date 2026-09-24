import { z } from "zod";

export const dateRangeQuerySchema = z
  .object({
    start: z.string().optional(),
    end: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.start && data.end) {
        const startTime = new Date(data.start).getTime();
        const endTime = new Date(data.end).getTime();
        return !isNaN(startTime) && !isNaN(endTime) && endTime >= startTime;
      }
      return true;
    },
    {
      message: "End date must be equal to or after start date",
      path: ["end"],
    }
  );

export type DateRangeQuerySchemaInput = z.infer<typeof dateRangeQuerySchema>;

export const dashboardDateRangeQuerySchema = z
  .object({
    todayStart: z.string().datetime().optional(),
    monthStart: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      const now = Date.now();
      return (
        (!data.todayStart || new Date(data.todayStart).getTime() <= now) &&
        (!data.monthStart || new Date(data.monthStart).getTime() <= now)
      );
    },
    {
      message: "Dashboard range cannot start in the future",
    }
  );
