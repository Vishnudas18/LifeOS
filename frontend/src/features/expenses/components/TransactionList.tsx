import {
  formatCurrency,
  formatCategoryName,
  formatPaymentMethodName,
  type Transaction,
} from "../types/transaction";
import {
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionListProps {
  transactions?: Transaction[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onAddNew: () => void;
  onRetry?: () => void;
}

export function TransactionList({
  transactions,
  isLoading,
  isError,
  error,
  page,
  totalPages,
  totalCount,
  onPageChange,
  onEdit,
  onDelete,
  onAddNew,
  onRetry,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border p-4 space-y-3 shadow-sm">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-card rounded-xl border p-8 text-center space-y-3 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold">Unable to load transactions</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          {error?.message || "An unexpected error occurred while loading your financial data."}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" className="mt-2">
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-dashed p-10 text-center space-y-3 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <TrendingUp className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">No transactions yet</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Start tracking your money by adding your first income or expense entry.
        </p>
        <Button onClick={onAddNew} size="sm" className="gap-1.5 mt-2">
          <Plus className="h-4 w-4" /> Add Transaction
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Table header for desktop */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
        <div className="col-span-2">Date</div>
        <div className="col-span-4">Description & Category</div>
        <div className="col-span-2">Payment</div>
        <div className="col-span-3 text-right">Amount</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {transactions.map((t) => {
          const isIncome = t.type === "INCOME";
          const formattedDate = new Date(t.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={t._id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-5 py-3.5 items-center hover:bg-muted/40 transition-colors"
            >
              {/* Date & Icon */}
              <div className="col-span-2 flex items-center gap-2.5">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    isIncome
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {isIncome ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {formattedDate}
                </span>
              </div>

              {/* Description & Category */}
              <div className="col-span-4 space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground line-clamp-1">
                    {t.description}
                  </p>
                  {t.isRecurring && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                      <Repeat className="h-2.5 w-2.5" />
                      Recurring
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                    {formatCategoryName(t.category)}
                  </span>
                  {t.notes && (
                    <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                      • {t.notes}
                    </span>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="col-span-2 text-xs font-medium text-muted-foreground">
                {formatPaymentMethodName(t.paymentMethod)}
              </div>

              {/* Amount */}
              <div className="col-span-3 text-right">
                <p
                  className={`text-sm font-bold tracking-tight ${
                    isIncome
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {isIncome ? `+${formatCurrency(t.amount, t.currency)}` : `-${formatCurrency(t.amount, t.currency)}`}
                </p>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => onEdit(t)}
                  title="Edit transaction"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(t)}
                  title="Delete transaction"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t bg-muted/20 text-xs text-muted-foreground">
          <div>
            Showing <span className="font-semibold text-foreground">{transactions.length}</span> of{" "}
            <span className="font-semibold text-foreground">{totalCount}</span> transactions
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-7 px-2"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
            </Button>

            <span className="font-medium text-foreground px-2">
              {page} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-7 px-2"
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
