import { Types } from "mongoose";

export enum NotificationType {
  TASK_REMINDER = "TASK_REMINDER",
  DEADLINE_REMINDER = "DEADLINE_REMINDER",
  GOAL_DEADLINE = "GOAL_DEADLINE",
  CALENDAR_REMINDER = "CALENDAR_REMINDER",
  FOCUS_COMPLETED = "FOCUS_COMPLETED",
  SYSTEM = "SYSTEM",
}

export enum NotificationChannel {
  IN_APP = "IN_APP",
  EMAIL = "EMAIL",
  PUSH = "PUSH",
}

export enum NotificationStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SENT = "SENT",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface INotification {
  _id: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt?: Date | null;
  channel: NotificationChannel;
  status: NotificationStatus;
  scheduledFor?: Date | null;
  relatedTaskId?: Types.ObjectId | string | null;
  relatedGoalId?: Types.ObjectId | string | null;
  relatedEventId?: Types.ObjectId | string | null;
  relatedFocusSessionId?: Types.ObjectId | string | null;
  metadata?: Record<string, any>;
  idempotencyKey?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  scheduledFor?: Date | null;
  relatedTaskId?: string | null;
  relatedGoalId?: string | null;
  relatedEventId?: string | null;
  relatedFocusSessionId?: string | null;
  metadata?: Record<string, any>;
  idempotencyKey?: string | null;
}

export interface NotificationQueryFilters {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}

export interface ICalendarReminderJobPayload {
  eventId: string;
  userId: string;
  title: string;
  startDateTime: string;
  minutesBefore: number;
  idempotencyKey: string;
}
