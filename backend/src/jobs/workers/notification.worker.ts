import { Worker } from "bullmq";
import { getRedisConnection } from "../../config/redis.js";
import { NOTIFICATION_QUEUE_NAME } from "../queues/notification.queue.js";
import { processNotificationJob } from "../processors/notification.processor.js";
import { logger } from "../../utils/logger.js";

let workerInstance: Worker | null = null;

export function startNotificationWorker(): Worker {
  if (!workerInstance) {
    const redis = getRedisConnection();

    workerInstance = new Worker(
      NOTIFICATION_QUEUE_NAME,
      async (job) => {
        await processNotificationJob(job);
      },
      {
        connection: redis,
        concurrency: 5,
      }
    );

    workerInstance.on("completed", (job) => {
      logger.info({ jobId: job.id, name: job.name }, "Notification job completed");
    });

    workerInstance.on("failed", (job, err) => {
      logger.error(
        { jobId: job?.id, name: job?.name, err: err.message },
        "Notification job failed"
      );
    });

    workerInstance.on("error", (err) => {
      logger.warn({ err: err.message }, "Notification worker connection error");
    });

    logger.info("Notification worker initialized and listening for jobs");
  }

  return workerInstance;
}

export async function stopNotificationWorker(): Promise<void> {
  if (workerInstance) {
    logger.info("Stopping notification worker...");
    await workerInstance.close();
    workerInstance = null;
    logger.info("Notification worker stopped cleanly.");
  }
}
