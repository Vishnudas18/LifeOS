import { Types } from "mongoose";

export interface DateRangeInput {
  start: string; // ISO string
  end: string;   // ISO string
}

export type TrendDirection = "UP" | "DOWN" | "NEUTRAL";

export interface MetricComparison {
  current: number;
  previous: number;
  difference: number;
  percentageChange: number | null; // null if previous is 0
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

export interface InsightCard {
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

export interface DailyTrendItem {
  date: string; // YYYY-MM-DD
  tasksCompleted: number;
  tasksCreated: number;
  focusSeconds: number;
  income: number;   // in base currency units (INR)
  expenses: number; // in base currency units (INR)
  eventsCount: number;
}

export interface OverviewAnalyticsResponse {
  range: {
    start: string;
    end: string;
  };
  previousRange: {
    start: string;
    end: string;
  };
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

export interface ProductivityAnalyticsResponse {
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

export interface FinancialAnalyticsResponse {
  totalIncome: number;    // in INR
  totalExpenses: number;  // in INR
  netCashFlow: number;    // in INR
  expenseByCategory: CategoryBreakdown[];
  incomeByCategory: CategoryBreakdown[];
  expenseByPaymentMethod: { method: string; amount: number; percentage: number }[];
  dailyTrend: { date: string; income: number; expenses: number }[];
}

export interface GoalAnalyticsResponse {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  goalsByCategory: { category: string; count: number }[];
  goalsByStatus: { status: string; count: number }[];
  averageProgress: number;
  milestoneStats: { total: number; completed: number; completionRate: number };
}

export interface FocusAnalyticsResponse {
  totalFocusSeconds: number;
  completedSessions: number;
  averageSessionSeconds: number;
  longestSessionSeconds: number;
  focusByMode: { mode: string; seconds: number; count: number }[];
  focusByTask: { taskId: string; title: string; seconds: number }[];
  focusByGoal: { goalId: string; title: string; seconds: number }[];
  dailyTrend: { date: string; focusSeconds: number; sessionsCount: number }[];
}

export interface CalendarAnalyticsResponse {
  totalEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  eventsByType: { type: string; count: number }[];
  dailyTrend: { date: string; eventsCount: number }[];
}

export interface InsightsResponse {
  insights: InsightCard[];
}

export interface DashboardAnalyticsResponse {
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
