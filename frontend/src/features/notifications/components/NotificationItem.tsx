import React from "react";
import type { NotificationItemData, NotificationType } from "../types/notification";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckSquare,
  Target,
  Timer,
  Bell,
  Check,
  Trash2,
} from "lucide-react";

interface NotificationItemProps {
  notification: NotificationItemData;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  isPending?: boolean;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSecs < 60) return "Just now";
  const mins = Math.floor(diffSecs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onDelete,
  isPending = false,
}) => {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "CALENDAR_REMINDER":
        return <Calendar className="w-4 h-4 text-indigo-500" />;
      case "TASK_REMINDER":
      case "DEADLINE_REMINDER":
        return <CheckSquare className="w-4 h-4 text-blue-500" />;
      case "GOAL_DEADLINE":
        return <Target className="w-4 h-4 text-emerald-500" />;
      case "FOCUS_COMPLETED":
        return <Timer className="w-4 h-4 text-purple-500" />;
      case "SYSTEM":
      default:
        return <Bell className="w-4 h-4 text-amber-500" />;
    }
  };

  const getBadgeText = (type: NotificationType) => {
    switch (type) {
      case "CALENDAR_REMINDER":
        return "Calendar";
      case "TASK_REMINDER":
      case "DEADLINE_REMINDER":
        return "Task";
      case "GOAL_DEADLINE":
        return "Goal";
      case "FOCUS_COMPLETED":
        return "Focus";
      case "SYSTEM":
      default:
        return "System";
    }
  };

  return (
    <div
      className={`p-3.5 rounded-lg border transition-all flex items-start space-x-3 ${
        notification.read
          ? "bg-card border-border/40 opacity-80"
          : "bg-muted/40 border-indigo-500/30 shadow-2xs"
      }`}
    >
      {/* Icon */}
      <div className="p-2 rounded-lg bg-background border border-border/60 shadow-2xs flex-shrink-0 mt-0.5">
        {getIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 truncate">
            <h4 className="text-xs font-bold text-foreground truncate">
              {notification.title}
            </h4>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
            )}
          </div>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
          {notification.message}
        </p>

        <div className="flex items-center justify-between pt-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">
            {getBadgeText(notification.type)}
          </Badge>

          <div className="flex items-center space-x-1">
            {!notification.read && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                title="Mark as read"
                onClick={() => onMarkRead(notification._id)}
                disabled={isPending}
              >
                <Check className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              title="Delete notification"
              onClick={() => onDelete(notification._id)}
              disabled={isPending}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
