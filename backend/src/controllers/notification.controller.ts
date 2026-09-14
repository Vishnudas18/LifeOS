import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { NotificationService } from "../services/notification.service.js";
import { notificationQuerySchema } from "../validators/notification.validator.js";
import { sendSuccess } from "../utils/response.js";

const notificationService = new NotificationService();

export async function getNotificationsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const queryInput = notificationQuerySchema.parse(req.query);
    const { notifications, total } = await notificationService.getUserNotifications(
      userId,
      queryInput
    );
    sendSuccess(
      res,
      { notifications, total, page: queryInput.page, limit: queryInput.limit },
      "Notifications retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
}

export async function getUnreadCountController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const count = await notificationService.getUnreadCount(userId);
    sendSuccess(res, { count }, "Unread notifications count retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function markAsReadController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const notificationId = req.params.id as string;
    const notification = await notificationService.markAsRead(userId, notificationId);
    sendSuccess(res, { notification }, "Notification marked as read successfully");
  } catch (error) {
    next(error);
  }
}

export async function markAllAsReadController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const result = await notificationService.markAllAsRead(userId);
    sendSuccess(res, result, "All notifications marked as read successfully");
  } catch (error) {
    next(error);
  }
}

export async function deleteNotificationController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const notificationId = req.params.id as string;
    await notificationService.deleteNotification(userId, notificationId);
    sendSuccess(res, null, "Notification deleted successfully");
  } catch (error) {
    next(error);
  }
}
