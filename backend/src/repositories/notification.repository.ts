import { FilterQuery, Types } from "mongoose";
import { Notification, INotificationDoc } from "../models/Notification.js";
import {
  CreateNotificationInput,
  NotificationChannel,
  NotificationStatus,
} from "../types/notification.types.js";
import { NotificationQuerySchemaInput } from "../validators/notification.validator.js";

export class NotificationRepository {
  async createNotification(
    input: CreateNotificationInput
  ): Promise<INotificationDoc> {
    if (input.idempotencyKey) {
      const existing = await this.findByIdempotencyKey(input.idempotencyKey);
      if (existing) return existing;
    }

    try {
      const notification = new Notification({
        ...input,
        userId: new Types.ObjectId(input.userId),
        channel: input.channel || NotificationChannel.IN_APP,
        status: input.status || NotificationStatus.SENT,
        relatedTaskId: input.relatedTaskId ? new Types.ObjectId(input.relatedTaskId) : null,
        relatedGoalId: input.relatedGoalId ? new Types.ObjectId(input.relatedGoalId) : null,
        relatedEventId: input.relatedEventId ? new Types.ObjectId(input.relatedEventId) : null,
        relatedFocusSessionId: input.relatedFocusSessionId
          ? new Types.ObjectId(input.relatedFocusSessionId)
          : null,
      });

      return await notification.save();
    } catch (err: any) {
      // Handle MongoDB duplicate key error for idempotencyKey gracefully
      if (err.code === 11000 && input.idempotencyKey) {
        const existing = await this.findByIdempotencyKey(input.idempotencyKey);
        if (existing) return existing;
      }
      throw err;
    }
  }

  async findByIdempotencyKey(
    idempotencyKey: string
  ): Promise<INotificationDoc | null> {
    return await Notification.findOne({ idempotencyKey }).exec();
  }

  async findNotifications(
    userId: string,
    filters: NotificationQuerySchemaInput
  ): Promise<{ notifications: INotificationDoc[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const query: FilterQuery<INotificationDoc> = {
      userId: new Types.ObjectId(userId),
    };

    if (filters.unreadOnly) {
      query.read = false;
    }
    if (filters.type) {
      query.type = filters.type;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("relatedTaskId", "title status priority")
        .populate("relatedGoalId", "title category progress")
        .populate("relatedEventId", "title type startDateTime")
        .populate("relatedFocusSessionId", "title mode actualDuration")
        .exec(),
      Notification.countDocuments(query),
    ]);

    return { notifications, total };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await Notification.countDocuments({
      userId: new Types.ObjectId(userId),
      read: false,
    });
  }

  async markAsRead(
    userId: string,
    notificationId: string
  ): Promise<INotificationDoc | null> {
    if (!Types.ObjectId.isValid(notificationId)) return null;

    return await Notification.findOneAndUpdate(
      {
        _id: new Types.ObjectId(notificationId),
        userId: new Types.ObjectId(userId),
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      },
      { new: true }
    ).exec();
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await Notification.updateMany(
      {
        userId: new Types.ObjectId(userId),
        read: false,
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      }
    );
    return result.modifiedCount;
  }

  async deleteNotification(
    userId: string,
    notificationId: string
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(notificationId)) return false;

    const result = await Notification.deleteOne({
      _id: new Types.ObjectId(notificationId),
      userId: new Types.ObjectId(userId),
    });

    return result.deletedCount > 0;
  }
}
