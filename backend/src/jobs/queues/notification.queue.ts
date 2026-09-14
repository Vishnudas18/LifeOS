import { Queue } from "bullmq";
import { getRedisConnection, checkIsRedisAvailable } from "../../config/redis.js";
import { ICalendarReminderJobPayload } from "../../types/notification.types.js";
import { logger } from "../../utils/logger.js";

export const NOTIFICATION_QUEUE_NAME = "notifications";

let notificationQueue: Queue | null = null;

export function getNotificationQueue(): Queue | null {
  if (!notificationQueue) {
    try {
      const redis = getRedisConnection();
      notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
        connection: redis,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: 100,
        },
      });

      notificationQueue.on("error", (err) => {
        logger.warn({ err: err.message }, "Notification queue error");
      });
    } catch (err: any) {
      logger.warn({ err: err.message }, "Failed to initialize notification queue");
      return null;
    }
  }

  return notificationQueue;
}

export async function scheduleCalendarReminderJob(
  payload: ICalendarReminderJobPayload,
  delayMs: number
): Promise<string | null> {
  try {
    const queue = getNotificationQueue();
    if (!queue) {
      logger.warn({ payload }, "Redis/Queue unavailable. Skipping reminder job scheduling.");
      return null;
    }

    const job = await queue.add("calendar-reminder", payload, {
      delay: Math.max(0, delayMs),
      jobId: payload.idempotencyKey, // Deterministic jobId prevents duplicate active jobs
    });

    logger.info(
      { jobId: job.id, eventId: payload.eventId, delayMs },
      "Calendar reminder job scheduled successfully"
    );

    return job.id || null;
  } catch (err: any) {
    logger.warn({ err: err.message, payload }, "Failed to schedule calendar reminder job");
    return null;
  }
}

export async function cancelCalendarReminderJob(
  idempotencyKey: string
): Promise<boolean> {
  try {
    const queue = getNotificationQueue();
    if (!queue) return false;

    const job = await queue.getJob(idempotencyKey);
    if (job) {
      await job.remove();
      logger.info({ idempotencyKey }, "Cancelled calendar reminder job");
      return true;
    }
    return false;
  } catch (err: any) {
    logger.warn({ err: err.message, idempotencyKey }, "Failed to cancel calendar reminder job");
    return false;
  }
}
