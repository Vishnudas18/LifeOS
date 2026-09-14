import {
  InsightCard,
  MetricComparison,
  CategoryBreakdown,
} from "../types/analytics.types.js";

export function generateInsights(data: {
  tasksCompleted: MetricComparison;
  tasksCreated: MetricComparison;
  totalExpenses: MetricComparison;
  totalIncome: MetricComparison;
  totalFocusSeconds: MetricComparison;
  averageFocusSeconds: MetricComparison;
  activeGoalsCount: number;
  averageGoalProgress: number;
  topExpenseCategory?: CategoryBreakdown | null;
  dailyTrends?: { date: string; focusSeconds: number; tasksCompleted: number }[];
}): InsightCard[] {
  const insights: InsightCard[] = [];

  // Helper for formatting duration
  const formatMins = (secs: number) => Math.round(secs / 60);

  // 1. Task Backlog Growth vs Clearance Rule
  const createdCur = data.tasksCreated.current;
  const completedCur = data.tasksCompleted.current;

  if (createdCur > completedCur && createdCur >= 3) {
    insights.push({
      id: "backlog-growth",
      type: "BACKLOG",
      severity: "WARNING",
      title: "Task Backlog Expanding",
      message: `You completed ${completedCur} task${completedCur === 1 ? "" : "s"} but created ${createdCur} new tasks in this period.`,
      metric: "Net Task Backlog",
      currentValue: createdCur - completedCur,
      direction: "UP",
    });
  } else if (completedCur > createdCur && completedCur > 0) {
    insights.push({
      id: "backlog-clearance",
      type: "PRODUCTIVITY",
      severity: "POSITIVE",
      title: "Backlog Clearing Momentum",
      message: `Great job! You completed ${completedCur} tasks while creating only ${createdCur} new tasks.`,
      metric: "Tasks Completed",
      currentValue: completedCur,
      direction: "UP",
    });
  }

  // 2. Task Completion Trend Rule
  if (
    data.tasksCompleted.percentageChange !== null &&
    data.tasksCompleted.percentageChange >= 15
  ) {
    insights.push({
      id: "task-completion-up",
      type: "PRODUCTIVITY",
      severity: "POSITIVE",
      title: "Increased Output",
      message: `You completed ${data.tasksCompleted.percentageChange}% more tasks compared to the previous period!`,
      metric: "Tasks Completed Change",
      currentValue: data.tasksCompleted.current,
      previousValue: data.tasksCompleted.previous,
      percentageChange: data.tasksCompleted.percentageChange,
      direction: "UP",
    });
  } else if (
    data.tasksCompleted.percentageChange !== null &&
    data.tasksCompleted.percentageChange <= -20
  ) {
    insights.push({
      id: "task-completion-down",
      type: "PRODUCTIVITY",
      severity: "WARNING",
      title: "Output Slowdown",
      message: `Task completions dropped by ${Math.abs(data.tasksCompleted.percentageChange)}% compared to the previous period.`,
      metric: "Tasks Completed Change",
      currentValue: data.tasksCompleted.current,
      previousValue: data.tasksCompleted.previous,
      percentageChange: data.tasksCompleted.percentageChange,
      direction: "DOWN",
    });
  }

  // 3. Focus Duration Trend Rule
  if (
    data.totalFocusSeconds.percentageChange !== null &&
    data.totalFocusSeconds.percentageChange >= 15
  ) {
    insights.push({
      id: "focus-time-up",
      type: "FOCUS",
      severity: "POSITIVE",
      title: "Focus Time Boost",
      message: `Your focus time increased by ${data.totalFocusSeconds.percentageChange}% compared to the previous period.`,
      metric: "Focus Minutes",
      currentValue: formatMins(data.totalFocusSeconds.current),
      previousValue: formatMins(data.totalFocusSeconds.previous),
      percentageChange: data.totalFocusSeconds.percentageChange,
      direction: "UP",
    });
  }

  if (data.averageFocusSeconds.current >= 900) {
    // >= 15 min avg
    insights.push({
      id: "average-focus-length",
      type: "FOCUS",
      severity: "INFO",
      title: "Focus Stamina",
      message: `Your average focus session duration is ${formatMins(data.averageFocusSeconds.current)} minutes.`,
      metric: "Average Session Mins",
      currentValue: `${formatMins(data.averageFocusSeconds.current)}m`,
      direction: "NEUTRAL",
    });
  }

  // 4. Financial Spending & Category Rule
  if (
    data.totalExpenses.percentageChange !== null &&
    data.totalExpenses.percentageChange >= 15
  ) {
    insights.push({
      id: "expenses-up",
      type: "FINANCE",
      severity: "WARNING",
      title: "Expense Increase",
      message: `You spent ${data.totalExpenses.percentageChange}% more in this period than in the previous period.`,
      metric: "Total Expenses",
      currentValue: `₹${data.totalExpenses.current.toLocaleString()}`,
      previousValue: `₹${data.totalExpenses.previous.toLocaleString()}`,
      percentageChange: data.totalExpenses.percentageChange,
      direction: "UP",
    });
  }

  if (data.topExpenseCategory && data.topExpenseCategory.amount > 0) {
    insights.push({
      id: "top-expense-category",
      type: "FINANCE",
      severity: "INFO",
      title: "Top Spending Area",
      message: `Your largest expense category was '${data.topExpenseCategory.category}' at ₹${data.topExpenseCategory.amount.toLocaleString()} (${data.topExpenseCategory.percentage}% of total expenses).`,
      metric: "Top Category",
      currentValue: data.topExpenseCategory.category,
      direction: "NEUTRAL",
    });
  }

  // 5. Goal Progress Momentum Rule
  if (data.activeGoalsCount > 0) {
    insights.push({
      id: "active-goals-progress",
      type: "GOAL",
      severity: "INFO",
      title: "Goal Momentum",
      message: `You have ${data.activeGoalsCount} goal${data.activeGoalsCount === 1 ? "" : "s"} in progress with an average progress of ${data.averageGoalProgress}%.`,
      metric: "Average Goal Progress",
      currentValue: `${data.averageGoalProgress}%`,
      direction: "NEUTRAL",
    });
  }

  // Fallback info insight if very little activity
  if (insights.length === 0) {
    insights.push({
      id: "getting-started",
      type: "PRODUCTIVITY",
      severity: "INFO",
      title: "Track Your Activity",
      message: "Complete tasks, record expenses, and start focus sessions to unlock personalized activity insights!",
      direction: "NEUTRAL",
    });
  }

  return insights.slice(0, 8);
}
