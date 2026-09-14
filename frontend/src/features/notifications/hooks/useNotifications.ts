import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notificationService";
import type {
  NotificationQueryFilters,
  GetNotificationsResponse,
} from "../types/notification";

export function useNotifications(filters: NotificationQueryFilters = {}) {
  return useQuery<GetNotificationsResponse, Error>({
    queryKey: ["notifications", filters],
    queryFn: () => notificationService.getNotifications(filters),
  });
}

export function useUnreadNotificationCount() {
  return useQuery<number, Error>({
    queryKey: ["notifications-unread-count"],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000, // 30-second polling
    staleTime: 1000 * 15,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}
