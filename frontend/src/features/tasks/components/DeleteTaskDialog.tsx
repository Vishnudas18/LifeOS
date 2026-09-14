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
import type { Task } from "../types/task";

interface DeleteTaskDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (taskId: string) => Promise<void>;
  isLoading?: boolean;
}

export function DeleteTaskDialog({
  task,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: DeleteTaskDialogProps) {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-xl border-destructive/30">
        <CardHeader className="flex flex-row items-center gap-3 pb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Delete Task?</CardTitle>
            <CardDescription className="text-xs">
              This action cannot be undone.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="py-2">
          <p className="text-xs text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{task.title}&quot;</span>?
          </p>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={async () => {
              await onConfirm(task._id);
              onClose();
            }}
            disabled={isLoading}
            className="gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
              </>
            ) : (
              "Delete Task"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
