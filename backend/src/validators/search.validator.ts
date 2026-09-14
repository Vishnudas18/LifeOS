import { z } from "zod";
import { SearchEntityType } from "../types/search.types.js";

const validTypes: SearchEntityType[] = [
  "TASK",
  "GOAL",
  "MILESTONE",
  "TRANSACTION",
  "CALENDAR_EVENT",
  "FOCUS_SESSION",
  "NOTIFICATION",
];

const typeAliasMap: Record<string, SearchEntityType> = {
  task: "TASK",
  tasks: "TASK",
  goal: "GOAL",
  goals: "GOAL",
  milestone: "MILESTONE",
  milestones: "MILESTONE",
  transaction: "TRANSACTION",
  transactions: "TRANSACTION",
  expense: "TRANSACTION",
  expenses: "TRANSACTION",
  calendar: "CALENDAR_EVENT",
  calendarevent: "CALENDAR_EVENT",
  calendar_event: "CALENDAR_EVENT",
  events: "CALENDAR_EVENT",
  focus: "FOCUS_SESSION",
  focussession: "FOCUS_SESSION",
  focus_session: "FOCUS_SESSION",
  notification: "NOTIFICATION",
  notifications: "NOTIFICATION",
};

export const searchQuerySchema = z.object({
  q: z
    .string({
      required_error: "Search query is required",
    })
    .trim()
    .min(1, "Search query cannot be empty")
    .max(100, "Search query cannot exceed 100 characters"),

  types: z
    .preprocess((val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      if (typeof val === "string") {
        return val.split(",").map((s) => s.trim()).filter(Boolean);
      }
      return val;
    }, z.array(z.string()).optional())
    .transform((rawTypes): SearchEntityType[] | undefined => {
      if (!rawTypes || rawTypes.length === 0) return undefined;
      const parsed: SearchEntityType[] = [];
      for (const t of rawTypes) {
        const upper = t.toUpperCase() as SearchEntityType;
        if (validTypes.includes(upper)) {
          if (!parsed.includes(upper)) parsed.push(upper);
        } else {
          const mapped = typeAliasMap[t.toLowerCase()];
          if (mapped && !parsed.includes(mapped)) {
            parsed.push(mapped);
          }
        }
      }
      return parsed.length > 0 ? parsed : undefined;
    })
    .optional(),

  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
