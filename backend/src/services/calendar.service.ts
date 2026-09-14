import { Types } from "mongoose";
import { CalendarRepository } from "../repositories/calendar.repository.js";
import { Task } from "../models/Task.js";
import { Goal } from "../models/Goal.js";
import { Milestone } from "../models/Milestone.js";
import {
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
  CalendarRangeQueryInput,
} from "../validators/calendar.validator.js";

import {
  scheduleCalendarReminderJob,
  cancelCalendarReminderJob,
} from "../jobs/queues/notification.queue.js";

export class CalendarError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = "CalendarError";
  }
}

export class CalendarService {
  private calendarRepository: CalendarRepository;

  constructor() {
    this.calendarRepository = new CalendarRepository();
  }

  private async tryScheduleReminder(event: any) {
    try {
      if (event && event.reminder && event.reminder.enabled && event.status !== "CANCELLED") {
        const startMs = new Date(event.startDateTime).getTime();
        const minsBefore = event.reminder.minutesBefore || 15;
        const scheduledMs = startMs - minsBefore * 60 * 1000;
        const delayMs = scheduledMs - Date.now();
        const idempotencyKey = `calendar-reminder-${event._id.toString()}-${startMs}-${minsBefore}`;

        if (delayMs > 0) {
          await scheduleCalendarReminderJob(
            {
              eventId: event._id.toString(),
              userId: event.userId.toString(),
              title: event.title,
              startDateTime: new Date(event.startDateTime).toISOString(),
              minutesBefore: minsBefore,
              idempotencyKey,
            },
            delayMs
          );
        }
      }
    } catch (err) {
      // Non-blocking catch
    }
  }

  private async validateRelatedEntityOwnership(
    userId: string,
    taskId?: string | null,
    goalId?: string | null,
    milestoneId?: string | null
  ) {
    const userObjId = new Types.ObjectId(userId);

    if (taskId) {
      if (!Types.ObjectId.isValid(taskId)) {
        throw new CalendarError("Invalid Task ID format", 400);
      }
      const task = await Task.findOne({
        _id: new Types.ObjectId(taskId),
        userId: userObjId,
      });
      if (!task) {
        throw new CalendarError("Task not found or does not belong to you", 404);
      }
    }

    if (goalId) {
      if (!Types.ObjectId.isValid(goalId)) {
        throw new CalendarError("Invalid Goal ID format", 400);
      }
      const goal = await Goal.findOne({
        _id: new Types.ObjectId(goalId),
        userId: userObjId,
      });
      if (!goal) {
        throw new CalendarError("Goal not found or does not belong to you", 404);
      }
    }

    if (milestoneId) {
      if (!Types.ObjectId.isValid(milestoneId)) {
        throw new CalendarError("Invalid Milestone ID format", 400);
      }
      const milestone = await Milestone.findOne({
        _id: new Types.ObjectId(milestoneId),
        userId: userObjId,
      });
      if (!milestone) {
        throw new CalendarError("Milestone not found or does not belong to you", 404);
      }

      if (goalId && milestone.goalId.toString() !== goalId) {
        throw new CalendarError(
          "Milestone does not belong to the selected Goal",
          400
        );
      }
    }
  }

  async createEvent(userId: string, input: CreateCalendarEventInput) {
    await this.validateRelatedEntityOwnership(
      userId,
      input.taskId,
      input.goalId,
      input.milestoneId
    );

    const event = await this.calendarRepository.createEvent(userId, input);
    await this.tryScheduleReminder(event);
    return event;
  }

  async getEventsInRange(userId: string, queryInput: CalendarRangeQueryInput) {
    return await this.calendarRepository.findEventsInRange(userId, queryInput);
  }

  async getEventById(userId: string, eventId: string) {
    const event = await this.calendarRepository.findEventById(userId, eventId);
    if (!event) {
      throw new CalendarError("Calendar event not found", 404);
    }
    return event;
  }

  async updateEvent(
    userId: string,
    eventId: string,
    input: UpdateCalendarEventInput
  ) {
    const existing = await this.calendarRepository.findEventById(userId, eventId);
    if (!existing) {
      throw new CalendarError("Calendar event not found", 404);
    }

    await this.validateRelatedEntityOwnership(
      userId,
      input.taskId !== undefined ? input.taskId : existing.taskId?.toString(),
      input.goalId !== undefined ? input.goalId : existing.goalId?.toString(),
      input.milestoneId !== undefined
        ? input.milestoneId
        : existing.milestoneId?.toString()
    );

    const updatedEvent = await this.calendarRepository.updateEvent(userId, eventId, input);
    if (updatedEvent) {
      await this.tryScheduleReminder(updatedEvent);
    }
    return updatedEvent;
  }

  async deleteEvent(userId: string, eventId: string) {
    const existing = await this.calendarRepository.findEventById(userId, eventId);
    if (!existing) {
      throw new CalendarError("Calendar event not found", 404);
    }

    const deleted = await this.calendarRepository.deleteEvent(userId, eventId);
    if (deleted && existing.reminder) {
      const startMs = new Date(existing.startDateTime).getTime();
      const minsBefore = existing.reminder.minutesBefore || 15;
      const idempotencyKey = `calendar-reminder-${existing._id.toString()}-${startMs}-${minsBefore}`;
      await cancelCalendarReminderJob(idempotencyKey);
    }
    return deleted;
  }
}
