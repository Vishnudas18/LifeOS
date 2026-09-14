import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export const ResetSettingsModal: React.FC<ResetSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isPending = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-start space-x-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Reset settings to default?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This will restore all your preferences (timezone, formatting, notifications, focus durations, calendar defaults) back to system defaults. Your tasks, goals, expenses, and events will not be deleted.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isPending}
            className="gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            {isPending ? "Resetting..." : "Reset Preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
};
