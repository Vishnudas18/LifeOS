import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Loader2, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from "../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<"ALL" | "UNREAD">("ALL");
  const popoverRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const {
    data: notificationsData,
    isLoading,
    isRefetching,
  } = useNotifications(filterType === "UNREAD" ? { unreadOnly: true } : {});

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();

  const notifications = notificationsData?.notifications || [];

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative h-9 w-9 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white px-1 ring-2 ring-background animate-in zoom-in">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-border/80 bg-muted/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-medium">
                  {unreadCount} unread
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0 || markAllReadMutation.isPending}
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                Mark all read
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-3.5 py-2 border-b border-border/40 flex items-center space-x-2 text-xs bg-muted/10">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterType === "ALL"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("UNREAD")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterType === "UNREAD"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Unread
            </button>
            {isRefetching && <Loader2 className="w-3 h-3 text-muted-foreground animate-spin ml-auto" />}
          </div>

          {/* Notification List Container */}
          <div className="max-h-[380px] overflow-y-auto p-3 space-y-2 divide-y-0">
            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground">
                <div className="p-3 rounded-full bg-muted/50 text-muted-foreground">
                  <BellOff className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium text-foreground">
                  {filterType === "UNREAD" ? "No unread notifications" : "No notifications yet"}
                </p>
                <p className="text-[11px] text-muted-foreground max-w-[200px]">
                  {filterType === "UNREAD"
                    ? "You've caught up with everything!"
                    : "Reminders for events and focus sessions will appear here."}
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <NotificationItem
                  key={item._id}
                  notification={item}
                  onMarkRead={(id) => markReadMutation.mutate(id)}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  isPending={markReadMutation.isPending || deleteMutation.isPending}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
