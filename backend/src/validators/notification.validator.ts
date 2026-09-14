import { z } from "zod";
import { NotificationType } from "../types/notification.types.js";

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  unreadOnly: z
    .preprocess((val) => {
      if (val === "true" || val === true) return true;
      if (val === "false" || val === false) return false;
      return undefined;
    }, z.boolean().optional())
    .optional(),
  type: z.nativeEnum(NotificationType).optional(),
});

export type NotificationQuerySchemaInput = z.infer<
  typeof notificationQuerySchema
>;
