export type TrendDirection = "UP" | "DOWN" | "NEUTRAL";

export interface MetricComparison {
  current: number;
  previous: number;
  difference: number;
  percentageChange: number | null;
  trendDirection: TrendDirection;
}

export type InsightType =
  | "PRODUCTIVITY"
  | "FINANCE"
  | "FOCUS"
  | "GOAL"
  | "CALENDAR"
  | "BACKLOG";

export type InsightSeverity = "INFO" | "POSITIVE" | "WARNING";

export interface InsightCardData {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  message: string;
  metric?: string;
  currentValue?: number | string;
  previousValue?: number | string;
  percentageChange?: number | null;
  direction?: TrendDirection;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface OverviewAnalytics {
  range: { start: string; end: string };
  previousRange: { start: string; end: string };
  tasksCompleted: MetricComparison;
  tasksCreated: MetricComparison;
  taskCompletionRate: MetricComparison;
  totalIncome: MetricComparison;
  totalExpenses: MetricComparison;
  netCashFlow: MetricComparison;
  goalsCompleted: MetricComparison;
  goalsInProgress: MetricComparison;
  totalFocusSeconds: MetricComparison;
  completedFocusSessions: MetricComparison;
  averageFocusSeconds: MetricComparison;
  calendarEvents: MetricComparison;
  completedCalendarEvents: MetricComparison;
}

export interface DashboardAnalytics {
  range: {
    todayStart: string;
    monthStart: string;
    end: string;
  };
  tasks: {
    pending: number;
    createdToday: number;
  };
  finance: {
    totalExpenses: number;
    totalIncome: number;
  };
  goals: {
    active: number;
    averageProgress: number;
  };
  focus: {
    totalFocusSeconds: number;
    completedSessions: number;
  };
  upcomingTasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority: string;
    status: string;
  }>;
}

export interface ProductivityAnalytics {
  tasksCreated: number;
  tasksCompleted: number;
  completionRate: number;
  tasksByPriority: { priority: string; count: number }[];
  tasksByStatus: { status: string; count: number }[];
  focusTimeSeconds: number;
  completedFocusSessions: number;
  averageFocusSessionSeconds: number;
  goalsProgress: { goalId: string; title: string; progress: number }[];
  milestonesCompleted: number;
  dailyTrend: { date: string; tasksCompleted: number; tasksCreated: number; focusSeconds: number }[];
}

export interface FinancialAnalytics {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  expenseByCategory: CategoryBreakdown[];
  incomeByCategory: CategoryBreakdown[];
  expenseByPaymentMethod: { method: string; amount: number; percentage: number }[];
  dailyTrend: { date: string; income: number; expenses: number }[];
}

export interface GoalAnalytics {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  goalsByCategory: { category: string; count: number }[];
  goalsByStatus: { status: string; count: number }[];
  averageProgress: number;
  milestoneStats: { total: number; completed: number; completionRate: number };
}

export interface FocusAnalytics {
  totalFocusSeconds: number;
  completedSessions: number;
  averageSessionSeconds: number;
  longestSessionSeconds: number;
  focusByMode: { mode: string; seconds: number; count: number }[];
  focusByTask: { taskId: string; title: string; seconds: number }[];
  focusByGoal: { goalId: string; title: string; seconds: number }[];
  dailyTrend: { date: string; focusSeconds: number; sessionsCount: number }[];
}

export interface CalendarAnalytics {
  totalEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  eventsByType: { type: string; count: number }[];
  dailyTrend: { date: string; eventsCount: number }[];
}

export interface DateRangePreset {
  label: string;
  getRange: () => { start: string; end: string };
}
