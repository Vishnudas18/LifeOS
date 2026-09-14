import { Schema, model, Document, Types } from "mongoose";
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from "../types/notification.types.js";

export interface INotificationDoc extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt?: Date | null;
  channel: NotificationChannel;
  status: NotificationStatus;
  scheduledFor?: Date | null;
  relatedTaskId?: Types.ObjectId | null;
  relatedGoalId?: Types.ObjectId | null;
  relatedEventId?: Types.ObjectId | null;
  relatedFocusSessionId?: Types.ObjectId | null;
  metadata?: Record<string, any>;
  idempotencyKey?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    channel: {
      type: String,
      enum: Object.values(NotificationChannel),
      default: NotificationChannel.IN_APP,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.SENT,
      required: true,
      index: true,
    },
    scheduledFor: {
      type: Date,
      default: null,
    },
    relatedTaskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    relatedGoalId: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      default: null,
    },
    relatedEventId: {
      type: Schema.Types.ObjectId,
      ref: "CalendarEvent",
      default: null,
    },
    relatedFocusSessionId: {
      type: Schema.Types.ObjectId,
      ref: "FocusSession",
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true, // Only enforces uniqueness when value is not null/undefined
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast lookups
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, status: 1, scheduledFor: 1 });

export const Notification = model<INotificationDoc>(
  "Notification",
  notificationSchema
);
