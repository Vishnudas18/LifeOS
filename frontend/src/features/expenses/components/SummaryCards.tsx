import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Hash } from "lucide-react";
import { formatCurrency, type TransactionSummary } from "../types/transaction";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardsProps {
  summary?: TransactionSummary;
  isLoading?: boolean;
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </Card>
        ))}
      </div>
    );
  }

  const income = summary?.totalIncome || 0;
  const expense = summary?.totalExpense || 0;
  const balance = summary?.balance || 0;
  const count = summary?.transactionCount || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Income */}
      <Card className="border shadow-sm transition-all hover:shadow-md">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Income
            </p>
            <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(income)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Total Expense */}
      <Card className="border shadow-sm transition-all hover:shadow-md">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Expenses
            </p>
            <p className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              -{formatCurrency(expense)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <TrendingDown className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Net Balance */}
      <Card className="border shadow-sm transition-all hover:shadow-md">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Net Balance
            </p>
            <p
              className={`text-2xl font-bold tracking-tight ${
                balance >= 0
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {balance >= 0 ? formatCurrency(balance) : `-${formatCurrency(Math.abs(balance))}`}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Transaction Count */}
      <Card className="border shadow-sm transition-all hover:shadow-md">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Transactions
            </p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {count}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Hash className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
