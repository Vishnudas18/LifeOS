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
import { formatCurrency, type Transaction } from "../types/transaction";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  transaction?: Transaction | null;
  isLoading?: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  isLoading,
}: DeleteConfirmationDialogProps) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Delete transaction?</CardTitle>
            <CardDescription className="text-xs">
              This action cannot be undone.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="py-3 text-xs text-muted-foreground space-y-2">
          <div className="rounded-lg bg-muted p-3 space-y-1">
            <p className="font-medium text-foreground">
              {transaction.description}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Amount:{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(transaction.amount, transaction.currency)}
              </span>
            </p>
          </div>
          <p>
            Are you sure you want to permanently delete this transaction from your records?
          </p>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 pt-2 pb-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
