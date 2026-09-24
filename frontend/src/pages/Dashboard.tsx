import type { ReactNode } from "react";
import { useMemo } from "react";
import { AlertCircle, CheckSquare, ListTodo, RefreshCw, Target, Timer, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardAnalytics } from "@/features/analytics/hooks/useAnalytics";
import { useUserSettings } from "@/features/settings/hooks/useSettings";
import { formatCurrency } from "@/features/expenses/types/transaction";
import { formatDate } from "@/utils/formatting";

interface DashboardStatCardProps {
  title: string;
  icon: ReactNode;
  value: string;
  description: string;
  isLoading: boolean;
  hasData: boolean;
}

function DashboardStatCard({
  title,
  icon,
  value,
  description,
  isLoading,
  hasData,
}: DashboardStatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="mt-2 h-3 w-32" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{hasData ? value : "—"}</div>
            <p className="text-xs text-muted-foreground">{hasData ? description : "Unable to load data"}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function formatFocusDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export default function Dashboard() {
  const { todayStart, monthStart } = useMemo(() => {
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);

    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      todayStart: dayStart.toISOString(),
      monthStart: currentMonthStart.toISOString(),
    };
  }, []);

  const { data, isLoading, isError, refetch } = useDashboardAnalytics(todayStart, monthStart);
  const { data: settings } = useUserSettings();
  const currency = settings?.preferences.currency || "INR";
  const hasData = Boolean(data) && !isError;
  const upcomingTasks = data?.upcomingTasks ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-sm text-muted-foreground">
          A live snapshot of your tasks, spending, goals, and focus today.
        </p>
      </div>

      {isError && (
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>Dashboard data could not be loaded. Please try again.</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          title="Pending Tasks"
          icon={<CheckSquare className="h-4 w-4 text-muted-foreground" />}
          value={String(data?.tasks.pending ?? 0)}
          description={`${pluralize(data?.tasks.createdToday ?? 0, "task")} added today`}
          isLoading={isLoading}
          hasData={hasData}
        />
        <DashboardStatCard
          title="Monthly Spending"
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          value={formatCurrency(data?.finance.totalExpenses ?? 0, currency)}
          description={`${formatCurrency(data?.finance.totalIncome ?? 0, currency)} income this month`}
          isLoading={isLoading}
          hasData={hasData}
        />
        <DashboardStatCard
          title="Active Goals"
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
          value={String(data?.goals.active ?? 0)}
          description={`${data?.goals.averageProgress ?? 0}% average progress`}
          isLoading={isLoading}
          hasData={hasData}
        />
        <DashboardStatCard
          title="Focus Time"
          icon={<Timer className="h-4 w-4 text-muted-foreground" />}
          value={formatFocusDuration(data?.focus.totalFocusSeconds ?? 0)}
          description={`${pluralize(data?.focus.completedSessions ?? 0, "session")} logged today`}
          isLoading={isLoading}
          hasData={hasData}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ListTodo className="h-4 w-4 text-muted-foreground" />
            Upcoming Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-12 w-full" />
              ))}
            </div>
          )}

          {!isLoading && hasData && upcomingTasks.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No upcoming tasks. You&apos;re all caught up.
            </p>
          )}

          {!isLoading && hasData && upcomingTasks.length > 0 && (
            <div className="space-y-2">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-4 rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due {formatDate(task.dueDate, settings?.preferences)}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {task.priority.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
