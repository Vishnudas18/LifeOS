import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getNotificationsController,
  getUnreadCountController,
  markAsReadController,
  markAllAsReadController,
  deleteNotificationController,
} from "../controllers/notification.controller.js";

const notificationRouter = Router();

// Protect all notification endpoints with authentication middleware
notificationRouter.use(authenticate);

notificationRouter.get("/", getNotificationsController);
notificationRouter.get("/unread-count", getUnreadCountController);
notificationRouter.patch("/:id/read", markAsReadController);
notificationRouter.post("/read-all", markAllAsReadController);
notificationRouter.delete("/:id", deleteNotificationController);

export default notificationRouter;
