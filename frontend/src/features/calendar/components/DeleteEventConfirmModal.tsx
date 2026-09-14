import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CalendarEvent } from "../types/calendar";

interface DeleteEventConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  event: CalendarEvent | null;
  isLoading?: boolean;
}

export function DeleteEventConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  event,
  isLoading,
}: DeleteEventConfirmModalProps) {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-2xl border-destructive/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-destructive/10 text-destructive shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Delete Event?</CardTitle>
              <CardDescription className="text-xs">
                This action will remove the event from your schedule.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">"{event.title}"</span>?
          </p>
          <p className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-md">
            Note: Any associated tasks or goals will NOT be deleted.
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-end gap-2 p-4 border-t bg-muted/20">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Event
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
