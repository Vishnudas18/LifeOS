export type NotificationType =
  | "TASK_REMINDER"
  | "DEADLINE_REMINDER"
  | "GOAL_DEADLINE"
  | "CALENDAR_REMINDER"
  | "FOCUS_COMPLETED"
  | "SYSTEM";

export type NotificationChannel = "IN_APP" | "EMAIL" | "PUSH";
export type NotificationStatus = "PENDING" | "PROCESSING" | "SENT" | "FAILED" | "CANCELLED";

export interface NotificationItemData {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt?: string | null;
  channel: NotificationChannel;
  status: NotificationStatus;
  scheduledFor?: string | null;
  relatedTaskId?: { _id: string; title: string; status: string } | string | null;
  relatedGoalId?: { _id: string; title: string; category: string } | string | null;
  relatedEventId?: { _id: string; title: string; type: string; startDateTime: string } | string | null;
  relatedFocusSessionId?: { _id: string; title: string; mode: string; actualDuration: number } | string | null;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQueryFilters {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}

export interface GetNotificationsResponse {
  notifications: NotificationItemData[];
  total: number;
  page: number;
  limit: number;
}
