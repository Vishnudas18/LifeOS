import { apiClient } from "@/services/apiClient";
import type {
  NotificationItemData,
  NotificationQueryFilters,
  GetNotificationsResponse,
} from "../types/notification";

export const notificationService = {
  async getNotifications(
    filters: NotificationQueryFilters = {}
  ): Promise<GetNotificationsResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.unreadOnly !== undefined)
      params.append("unreadOnly", filters.unreadOnly.toString());
    if (filters.type) params.append("type", filters.type);

    const queryString = params.toString();
    const endpoint = `/notifications${queryString ? `?${queryString}` : ""}`;
    const res = await apiClient<GetNotificationsResponse>(endpoint);

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch notifications");
    }
    return res.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient<{ count: number }>("/notifications/unread-count");
    if (!res.success || res.data === undefined) {
      throw new Error(res.message || "Failed to fetch unread notification count");
    }
    return res.data.count;
  },

  async markAsRead(id: string): Promise<NotificationItemData> {
    const res = await apiClient<{ notification: NotificationItemData }>(
      `/notifications/${id}/read`,
      { method: "PATCH" }
    );
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to mark notification as read");
    }
    return res.data.notification;
  },

  async markAllAsRead(): Promise<number> {
    const res = await apiClient<{ markedReadCount: number }>(
      "/notifications/read-all",
      { method: "POST" }
    );
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to mark all notifications as read");
    }
    return res.data.markedReadCount;
  },

  async deleteNotification(id: string): Promise<void> {
    const res = await apiClient<null>(`/notifications/${id}`, {
      method: "DELETE",
    });
    if (!res.success) {
      throw new Error(res.message || "Failed to delete notification");
    }
  },
};
