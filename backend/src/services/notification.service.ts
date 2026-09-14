import { NotificationRepository } from "../repositories/notification.repository.js";
import { CreateNotificationInput, NotificationType } from "../types/notification.types.js";
import { NotificationQuerySchemaInput } from "../validators/notification.validator.js";
import { User } from "../models/User.js";

export class NotificationError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = "NotificationError";
  }
}

export class NotificationService {
  private repository: NotificationRepository;

  constructor() {
    this.repository = new NotificationRepository();
  }

  async createInAppNotification(input: CreateNotificationInput) {
    // Check target user's active notification preferences
    const user = await User.findById(input.userId).select("preferences").exec();
    if (user && user.preferences && user.preferences.notifications) {
      const notifPref = user.preferences.notifications;

      // If global inApp notifications disabled for user, skip delivery
      if (notifPref.inApp === false) {
        return null;
      }

      // Check category specific preference
      switch (input.type) {
        case NotificationType.CALENDAR_REMINDER:
          if (notifPref.calendarReminders === false) return null;
          break;
        case NotificationType.TASK_REMINDER:
        case NotificationType.DEADLINE_REMINDER:
          if (notifPref.taskReminders === false) return null;
          break;
        case NotificationType.GOAL_DEADLINE:
          if (notifPref.goalReminders === false) return null;
          break;
        case NotificationType.FOCUS_COMPLETED:
          if (notifPref.focusCompletion === false) return null;
          break;
      }
    }

    return await this.repository.createNotification(input);
  }

  async getUserNotifications(userId: string, filters: NotificationQuerySchemaInput) {
    return await this.repository.findNotifications(userId, filters);
  }

  async getUnreadCount(userId: string) {
    return await this.repository.getUnreadCount(userId);
  }

  async markAsRead(userId: string, notificationId: string) {
    const updated = await this.repository.markAsRead(userId, notificationId);
    if (!updated) {
      throw new NotificationError("Notification not found", 404);
    }
    return updated;
  }

  async markAllAsRead(userId: string) {
    const count = await this.repository.markAllAsRead(userId);
    return { markedReadCount: count };
  }

  async deleteNotification(userId: string, notificationId: string) {
    const deleted = await this.repository.deleteNotification(userId, notificationId);
    if (!deleted) {
      throw new NotificationError("Notification not found", 404);
    }
    return true;
  }
}
