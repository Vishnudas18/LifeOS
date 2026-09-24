import { AnalyticsRepository } from "../repositories/analytics.repository.js";
import { generateInsights } from "./insightEngine.service.js";
import {
  MetricComparison,
  DashboardAnalyticsResponse,
  OverviewAnalyticsResponse,
  TrendDirection,
} from "../types/analytics.types.js";

export class AnalyticsError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = "AnalyticsError";
  }
}

export class AnalyticsService {
  private repository: AnalyticsRepository;

  constructor() {
    this.repository = new AnalyticsRepository();
  }

  private calculateComparison(current: number, previous: number): MetricComparison {
    const difference = current - previous;

    let percentageChange: number | null = null;
    if (previous > 0) {
      percentageChange = Math.round(((current - previous) / previous) * 100);
    } else if (current > 0 && previous === 0) {
      percentageChange = null; // Prior period was 0
    } else {
      percentageChange = 0;
    }

    let trendDirection: TrendDirection = "NEUTRAL";
    if (difference > 0) trendDirection = "UP";
    if (difference < 0) trendDirection = "DOWN";

    return {
      current,
      previous,
      difference,
      percentageChange,
      trendDirection,
    };
  }

  private parseDates(startDateStr?: string, endDateStr?: string) {
    const now = new Date();
    const endDate = endDateStr ? new Date(endDateStr) : now;

    // Default start to 7 days before end date if omitted
    const defaultStart = new Date(endDate);
    defaultStart.setDate(defaultStart.getDate() - 7);
    defaultStart.setHours(0, 0, 0, 0);

    const startDate = startDateStr ? new Date(startDateStr) : defaultStart;

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new AnalyticsError("Invalid start or end date format", 400);
    }

    if (endDate < startDate) {
      throw new AnalyticsError("End date cannot be before start date", 400);
    }

    // Previous period range calculation
    const durationMs = endDate.getTime() - startDate.getTime();
    const prevEndDate = new Date(startDate.getTime() - 1);
    const prevStartDate = new Date(startDate.getTime() - durationMs);

    return { startDate, endDate, prevStartDate, prevEndDate };
  }

  async getOverview(userId: string, startDateStr?: string, endDateStr?: string): Promise<OverviewAnalyticsResponse> {
    const { startDate, endDate, prevStartDate, prevEndDate } = this.parseDates(startDateStr, endDateStr);

    const [
      currTasks,
      prevTasks,
      currTx,
      prevTx,
      currGoals,
      prevGoals,
      currFocus,
      prevFocus,
      currCal,
      prevCal,
    ] = await Promise.all([
      this.repository.getTasksStats(userId, startDate, endDate),
      this.repository.getTasksStats(userId, prevStartDate, prevEndDate),
      this.repository.getTransactionsStats(userId, startDate, endDate),
      this.repository.getTransactionsStats(userId, prevStartDate, prevEndDate),
      this.repository.getGoalsStats(userId, startDate, endDate),
      this.repository.getGoalsStats(userId, prevStartDate, prevEndDate),
      this.repository.getFocusStats(userId, startDate, endDate),
      this.repository.getFocusStats(userId, prevStartDate, prevEndDate),
      this.repository.getCalendarStats(userId, startDate, endDate),
      this.repository.getCalendarStats(userId, prevStartDate, prevEndDate),
    ]);

    return {
      range: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      previousRange: {
        start: prevStartDate.toISOString(),
        end: prevEndDate.toISOString(),
      },
      tasksCompleted: this.calculateComparison(currTasks.tasksCompleted, prevTasks.tasksCompleted),
      tasksCreated: this.calculateComparison(currTasks.tasksCreated, prevTasks.tasksCreated),
      taskCompletionRate: this.calculateComparison(currTasks.completionRate, prevTasks.completionRate),
      totalIncome: this.calculateComparison(currTx.totalIncome, prevTx.totalIncome),
      totalExpenses: this.calculateComparison(currTx.totalExpenses, prevTx.totalExpenses),
      netCashFlow: this.calculateComparison(currTx.netCashFlow, prevTx.netCashFlow),
      goalsCompleted: this.calculateComparison(currGoals.completedGoals, prevGoals.completedGoals),
      goalsInProgress: this.calculateComparison(currGoals.activeGoals, prevGoals.activeGoals),
      totalFocusSeconds: this.calculateComparison(currFocus.totalFocusSeconds, prevFocus.totalFocusSeconds),
      completedFocusSessions: this.calculateComparison(currFocus.completedSessions, prevFocus.completedSessions),
      averageFocusSeconds: this.calculateComparison(currFocus.averageSessionSeconds, prevFocus.averageSessionSeconds),
      calendarEvents: this.calculateComparison(currCal.totalEvents, prevCal.totalEvents),
      completedCalendarEvents: this.calculateComparison(currCal.completedEvents, prevCal.completedEvents),
    };
  }

  async getDashboard(
    userId: string,
    todayStartStr?: string,
    monthStartStr?: string
  ): Promise<DashboardAnalyticsResponse> {
    const now = new Date();
    const todayStart = todayStartStr ? new Date(todayStartStr) : new Date(now);
    const monthStart = monthStartStr ? new Date(monthStartStr) : new Date(now);

    if (isNaN(todayStart.getTime()) || isNaN(monthStart.getTime())) {
      throw new AnalyticsError("Invalid dashboard date range", 400);
    }

    if (!todayStartStr) {
      todayStart.setHours(0, 0, 0, 0);
    }
    if (!monthStartStr) {
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
    }

    const [todayTasks, monthlyFinance, goalStats, focusStats, upcomingTasks] = await Promise.all([
      this.repository.getTasksStats(userId, todayStart, now),
      this.repository.getTransactionsStats(userId, monthStart, now),
      this.repository.getGoalsStats(userId, monthStart, now),
      this.repository.getFocusStats(userId, todayStart, now),
      this.repository.getUpcomingTasks(userId, todayStart),
    ]);

    const pending = todayTasks.tasksByStatus
      .filter((task) => task.status !== "COMPLETED")
      .reduce((total, task) => total + task.count, 0);

    return {
      range: {
        todayStart: todayStart.toISOString(),
        monthStart: monthStart.toISOString(),
        end: now.toISOString(),
      },
      tasks: {
        pending,
        createdToday: todayTasks.tasksCreated,
      },
      finance: {
        totalExpenses: monthlyFinance.totalExpenses,
        totalIncome: monthlyFinance.totalIncome,
      },
      goals: {
        active: goalStats.activeGoals,
        averageProgress: goalStats.averageProgress,
      },
      focus: {
        totalFocusSeconds: focusStats.totalFocusSeconds,
        completedSessions: focusStats.completedSessions,
      },
      upcomingTasks,
    };
  }

  async getProductivityAnalytics(userId: string, startDateStr?: string, endDateStr?: string) {
    const { startDate, endDate } = this.parseDates(startDateStr, endDateStr);
    const [tasksStats, focusStats, goalsStats, dailyTrend] = await Promise.all([
      this.repository.getTasksStats(userId, startDate, endDate),
      this.repository.getFocusStats(userId, startDate, endDate),
      this.repository.getGoalsStats(userId, startDate, endDate),
      this.repository.getDailyTrends(userId, startDate, endDate),
    ]);

    return {
      tasksCreated: tasksStats.tasksCreated,
      tasksCompleted: tasksStats.tasksCompleted,
      completionRate: tasksStats.completionRate,
      tasksByPriority: tasksStats.tasksByPriority,
      tasksByStatus: tasksStats.tasksByStatus,
      focusTimeSeconds: focusStats.totalFocusSeconds,
      completedFocusSessions: focusStats.completedSessions,
      averageFocusSessionSeconds: focusStats.averageSessionSeconds,
      goalsProgress: goalsStats.goalsProgress,
      milestonesCompleted: goalsStats.milestoneStats.completed,
      dailyTrend: dailyTrend.map((d) => ({
        date: d.date,
        tasksCompleted: d.tasksCompleted,
        tasksCreated: d.tasksCreated,
        focusSeconds: d.focusSeconds,
      })),
    };
  }

  async getFinancialAnalytics(userId: string, startDateStr?: string, endDateStr?: string) {
    const { startDate, endDate } = this.parseDates(startDateStr, endDateStr);
    const [txStats, dailyTrend] = await Promise.all([
      this.repository.getTransactionsStats(userId, startDate, endDate),
      this.repository.getDailyTrends(userId, startDate, endDate),
    ]);

    return {
      totalIncome: txStats.totalIncome,
      totalExpenses: txStats.totalExpenses,
      netCashFlow: txStats.netCashFlow,
      expenseByCategory: txStats.expenseByCategory,
      incomeByCategory: txStats.incomeByCategory,
      expenseByPaymentMethod: txStats.expenseByPaymentMethod,
      dailyTrend: dailyTrend.map((d) => ({
        date: d.date,
        income: d.income,
        expenses: d.expenses,
      })),
    };
  }

  async getGoalAnalytics(userId: string, startDateStr?: string, endDateStr?: string) {
    const { startDate, endDate } = this.parseDates(startDateStr, endDateStr);
    return await this.repository.getGoalsStats(userId, startDate, endDate);
  }

  async getFocusAnalytics(userId: string, startDateStr?: string, endDateStr?: string) {
    const { startDate, endDate } = this.parseDates(startDateStr, endDateStr);
    const [focusStats, dailyTrend] = await Promise.all([
      this.repository.getFocusStats(userId, startDate, endDate),
      this.repository.getDailyTrends(userId, startDate, endDate),
    ]);

    return {
      ...focusStats,
      dailyTrend: dailyTrend.map((d) => ({
        date: d.date,
        focusSeconds: d.focusSeconds,
        sessionsCount: d.sessionsCount,
      })),
    };
  }

  async getCalendarAnalytics(userId: string, startDateStr?: string, endDateStr?: string) {
    const { startDate, endDate } = this.parseDates(startDateStr, endDateStr);
    const [calStats, dailyTrend] = await Promise.all([
      this.repository.getCalendarStats(userId, startDate, endDate),
      this.repository.getDailyTrends(userId, startDate, endDate),
    ]);

    return {
      ...calStats,
      dailyTrend: dailyTrend.map((d) => ({
        date: d.date,
        eventsCount: d.eventsCount,
      })),
    };
  }

  async getInsights(userId: string, startDateStr?: string, endDateStr?: string) {
    const overview = await this.getOverview(userId, startDateStr, endDateStr);
    const { startDate, endDate } = this.parseDates(startDateStr, endDateStr);

    const [txStats, goalStats, dailyTrends] = await Promise.all([
      this.repository.getTransactionsStats(userId, startDate, endDate),
      this.repository.getGoalsStats(userId, startDate, endDate),
      this.repository.getDailyTrends(userId, startDate, endDate),
    ]);

    const topExpenseCategory = txStats.expenseByCategory[0] || null;

    const insights = generateInsights({
      tasksCompleted: overview.tasksCompleted,
      tasksCreated: overview.tasksCreated,
      totalExpenses: overview.totalExpenses,
      totalIncome: overview.totalIncome,
      totalFocusSeconds: overview.totalFocusSeconds,
      averageFocusSeconds: overview.averageFocusSeconds,
      activeGoalsCount: goalStats.activeGoals,
      averageGoalProgress: goalStats.averageProgress,
      topExpenseCategory,
      dailyTrends,
    });

    return { insights };
  }
}
