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
