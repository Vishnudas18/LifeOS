import React from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export const OfflineBanner: React.FC = () => {
  const { isOnline } = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center justify-center space-x-2 animate-in slide-in-from-top duration-200 z-40 relative"
    >
      <WifiOff className="w-4 h-4 flex-shrink-0" />
      <span className="truncate">
        You're offline. Some features may be unavailable until your connection returns.
      </span>
    </div>
  );
};
