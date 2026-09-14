import React, { useState } from "react";
import {
  useAnalyticsOverview,
  useProductivityAnalytics,
  useFinancialAnalytics,
  useGoalAnalytics,
  useCalendarAnalytics,
  useAnalyticsInsights,
} from "../hooks/useAnalytics";
import { DateRangeSelector } from "../components/DateRangeSelector";
import { KpiCard } from "../components/KpiCard";
import { InsightCardList } from "../components/InsightCardList";
import { ProductivityCharts } from "../components/ProductivityCharts";
import { FinancialCharts } from "../components/FinancialCharts";
import { GoalCharts } from "../components/GoalCharts";
import { CalendarCharts } from "../components/CalendarCharts";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  CreditCard,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const AnalyticsPage: React.FC = () => {
  // Default range: Last 7 Days
  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setDate(defaultStart.getDate() - 7);
  defaultStart.setHours(0, 0, 0, 0);

  const [startDate, setStartDate] = useState<string>(defaultStart.toISOString());
  const [endDate, setEndDate] = useState<string>(now.toISOString());

  // TanStack Query server state
  const { data: overview, isLoading: isOverviewLoading, error: overviewError, refetch } = useAnalyticsOverview(startDate, endDate);
  const { data: productivity, isLoading: isProdLoading } = useProductivityAnalytics(startDate, endDate);
  const { data: financial, isLoading: isFinLoading } = useFinancialAnalytics(startDate, endDate);
  const { data: goals, isLoading: isGoalsLoading } = useGoalAnalytics(startDate, endDate);
  const { data: calendar, isLoading: isCalLoading } = useCalendarAnalytics(startDate, endDate);
  const { data: insights, isLoading: isInsightsLoading } = useAnalyticsInsights(startDate, endDate);

  const handleDateChange = (newStart: string, newEnd: string) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const formatCurrency = (val: number) => `₹${val.toLocaleString()}`;
  const formatFocusDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in-50">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-indigo-500" />
            Analytics & Insights
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Data-driven trends, period-over-period comparisons, and actionable life metrics.
          </p>
        </div>
      </div>

      {/* Date Range Selector */}
      <DateRangeSelector
        start={startDate}
        end={endDate}
        onChangeRange={handleDateChange}
      />

      {/* Error state */}
      {overviewError && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>Unable to load analytics data. Please try again.</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
          </Button>
        </div>
      )}

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Tasks Completed"
          metric={overview?.tasksCompleted}
          formatter={(v) => `${v} tasks`}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          isLoading={isOverviewLoading}
        />
        <KpiCard
          title="Focus Time"
          metric={overview?.totalFocusSeconds}
          formatter={formatFocusDuration}
          icon={<Clock className="w-4 h-4 text-indigo-500" />}
          isLoading={isOverviewLoading}
        />
        <KpiCard
          title="Total Expenses"
          metric={overview?.totalExpenses}
          formatter={formatCurrency}
          icon={<CreditCard className="w-4 h-4 text-rose-500" />}
          isLoading={isOverviewLoading}
          invertColorLogic={true} // Higher expense is warning
        />
        <KpiCard
          title="Net Cash Flow"
          metric={overview?.netCashFlow}
          formatter={formatCurrency}
          icon={<TrendingUp className="w-4 h-4 text-amber-500" />}
          isLoading={isOverviewLoading}
        />
      </div>

      {/* Actionable Rule-Based Insights */}
      <InsightCardList insights={insights} isLoading={isInsightsLoading} />

      {/* Productivity Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Productivity & Focus Trends</h2>
        <ProductivityCharts
          dailyTrend={productivity?.dailyTrend}
          isLoading={isProdLoading}
        />
      </div>

      {/* Financial Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Financial Overview</h2>
        <FinancialCharts
          financial={financial}
          isLoading={isFinLoading}
        />
      </div>

      {/* Goals & Calendar Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Goals & Calendar Activity</h2>
        <GoalCharts goals={goals} isLoading={isGoalsLoading} />
        <CalendarCharts calendar={calendar} isLoading={isCalLoading} />
      </div>
    </div>
  );
};
