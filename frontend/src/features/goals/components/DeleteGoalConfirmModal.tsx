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
import type { Goal } from "../types/goal";

interface DeleteGoalConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  goal: Goal | null;
  isLoading?: boolean;
}

export function DeleteGoalConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  goal,
  isLoading,
}: DeleteGoalConfirmModalProps) {
  if (!isOpen || !goal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-2xl border-destructive/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-destructive/10 text-destructive shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Delete Goal?</CardTitle>
              <CardDescription className="text-xs">
                This action cannot be undone.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">"{goal.title}"</span>?
          </p>
          <div className="p-3 bg-muted/40 rounded-lg text-[11px] space-y-1">
            <p className="font-medium text-foreground">What happens to related data:</p>
            <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
              <li>All milestones for this goal will be removed.</li>
              <li>Associated tasks will remain safe, but will be unlinked.</li>
            </ul>
          </div>
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
            Delete Goal
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
