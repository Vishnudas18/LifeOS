import { Job } from "bullmq";
import { CalendarEvent } from "../../models/CalendarEvent.js";
import { NotificationService } from "../../services/notification.service.js";
import {
  ICalendarReminderJobPayload,
  NotificationType,
} from "../../types/notification.types.js";
import { logger } from "../../utils/logger.js";

const notificationService = new NotificationService();

export async function processNotificationJob(job: Job): Promise<void> {
  logger.info({ jobId: job.id, name: job.name }, "Processing notification job");

  if (job.name === "calendar-reminder") {
    const payload = job.data as ICalendarReminderJobPayload;

    // 1. Fetch current event document from MongoDB (do NOT trust payload alone)
    const event = await CalendarEvent.findById(payload.eventId).exec();

    if (!event) {
      logger.info(
        { eventId: payload.eventId },
        "Event was deleted. Skipping stale reminder job."
      );
      return;
    }

    // 2. Validate ownership
    if (event.userId.toString() !== payload.userId) {
      logger.warn(
        { eventId: payload.eventId },
        "Event ownership mismatch. Skipping reminder job."
      );
      return;
    }

    // 3. Check event status
    if (event.status === "CANCELLED") {
      logger.info(
        { eventId: payload.eventId },
        "Event is cancelled. Skipping reminder job."
      );
      return;
    }

    // 4. Check reminder configuration
    if (!event.reminder || !event.reminder.enabled) {
      logger.info(
        { eventId: payload.eventId },
        "Reminder was disabled for event. Skipping reminder job."
      );
      return;
    }

    // 5. Verify startDateTime matching (stale check if event time changed)
    if (
      new Date(event.startDateTime).getTime() !==
      new Date(payload.startDateTime).getTime()
    ) {
      logger.info(
        { eventId: payload.eventId },
        "Event start date-time was modified. Skipping stale reminder job."
      );
      return;
    }

    // 6. Create in-app notification idempotently
    await notificationService.createInAppNotification({
      userId: event.userId.toString(),
      type: NotificationType.CALENDAR_REMINDER,
      title: `Reminder: ${event.title}`,
      message: `Event '${event.title}' is scheduled to start in ${payload.minutesBefore} minutes.`,
      relatedEventId: event._id.toString(),
      idempotencyKey: payload.idempotencyKey,
      metadata: {
        location: event.location || "",
        startDateTime: event.startDateTime.toISOString(),
      },
    });

    logger.info(
      { eventId: event._id.toString(), title: event.title },
      "Calendar reminder notification created successfully"
    );
  }
}
