import { Types } from "mongoose";
import { Task } from "../models/Task.js";
import { Transaction } from "../models/Transaction.js";
import { Goal } from "../models/Goal.js";
import { Milestone } from "../models/Milestone.js";
import { CalendarEvent } from "../models/CalendarEvent.js";
import { FocusSession } from "../models/FocusSession.js";
import { FocusStatus } from "../types/focus.types.js";

export class AnalyticsRepository {
  async getUpcomingTasks(userId: string, startDate: Date, limit = 5) {
    const userObjId = new Types.ObjectId(userId);
    const tasks = await Task.find({
      userId: userObjId,
      status: { $ne: "COMPLETED" },
      dueDate: { $gte: startDate },
    })
      .sort({ dueDate: 1, priority: -1 })
      .limit(limit)
      .select("title dueDate priority status")
      .lean();

    return tasks.map((task) => ({
      id: task._id.toString(),
      title: task.title,
      dueDate: task.dueDate!.toISOString(),
      priority: task.priority,
      status: task.status,
    }));
  }

  async getTasksStats(userId: string, startDate: Date, endDate: Date) {
    const userObjId = new Types.ObjectId(userId);

    const [createdCount, completedCount, priorityStats, statusStats] = await Promise.all([
      Task.countDocuments({
        userId: userObjId,
        createdAt: { $gte: startDate, $lte: endDate },
      }),
      Task.countDocuments({
        userId: userObjId,
        status: "COMPLETED",
        updatedAt: { $gte: startDate, $lte: endDate },
      }),
      Task.aggregate([
        {
          $match: {
            userId: userObjId,
            createdAt: { $lte: endDate },
          },
        },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        {
          $match: {
            userId: userObjId,
            createdAt: { $lte: endDate },
          },
        },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const completionRate =
      createdCount > 0 ? Math.round((completedCount / createdCount) * 100) : 0;

    return {
      tasksCreated: createdCount,
      tasksCompleted: completedCount,
      completionRate,
      tasksByPriority: priorityStats.map((p) => ({ priority: p._id || "MEDIUM", count: p.count })),
      tasksByStatus: statusStats.map((s) => ({ status: s._id || "TODO", count: s.count })),
    };
  }

  async getTransactionsStats(userId: string, startDate: Date, endDate: Date) {
    const userObjId = new Types.ObjectId(userId);

    const [totals, expenseCategoryAgg, incomeCategoryAgg, paymentMethodAgg] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: userObjId,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$type",
            totalPaise: { $sum: "$amount" },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: userObjId,
            type: "EXPENSE",
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$category",
            totalPaise: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalPaise: -1 } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: userObjId,
            type: "INCOME",
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$category",
            totalPaise: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalPaise: -1 } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: userObjId,
            type: "EXPENSE",
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$paymentMethod",
            totalPaise: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    let totalIncomePaise = 0;
    let totalExpensesPaise = 0;

    for (const item of totals) {
      if (item._id === "INCOME") totalIncomePaise = item.totalPaise;
      if (item._id === "EXPENSE") totalExpensesPaise = item.totalPaise;
    }

    const totalIncome = totalIncomePaise / 100;
    const totalExpenses = totalExpensesPaise / 100;
    const netCashFlow = totalIncome - totalExpenses;

    const expenseByCategory = expenseCategoryAgg.map((cat) => ({
      category: cat._id,
      amount: cat.totalPaise / 100,
      count: cat.count,
      percentage: totalExpensesPaise > 0 ? Math.round((cat.totalPaise / totalExpensesPaise) * 100) : 0,
    }));

    const incomeByCategory = incomeCategoryAgg.map((cat) => ({
      category: cat._id,
      amount: cat.totalPaise / 100,
      count: cat.count,
      percentage: totalIncomePaise > 0 ? Math.round((cat.totalPaise / totalIncomePaise) * 100) : 0,
    }));

    const expenseByPaymentMethod = paymentMethodAgg.map((pm) => ({
      method: pm._id,
      amount: pm.totalPaise / 100,
      percentage: totalExpensesPaise > 0 ? Math.round((pm.totalPaise / totalExpensesPaise) * 100) : 0,
    }));

    return {
      totalIncome,
      totalExpenses,
      netCashFlow,
      expenseByCategory,
      incomeByCategory,
      expenseByPaymentMethod,
    };
  }

  async getGoalsStats(userId: string, startDate: Date, endDate: Date) {
    const userObjId = new Types.ObjectId(userId);

    const [goalsAgg, categoryAgg, statusAgg, milestoneTotal, milestoneCompleted, goalsList] = await Promise.all([
      Goal.aggregate([
        {
          $match: {
            userId: userObjId,
            createdAt: { $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalGoals: { $sum: 1 },
            activeGoals: {
              $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] },
            },
            completedGoals: {
              $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
            },
            averageProgress: { $avg: "$progress" },
          },
        },
      ]),
      Goal.aggregate([
        {
          $match: {
            userId: userObjId,
            createdAt: { $lte: endDate },
          },
        },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
      Goal.aggregate([
        {
          $match: {
            userId: userObjId,
            createdAt: { $lte: endDate },
          },
        },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Milestone.countDocuments({
        userId: userObjId,
        createdAt: { $lte: endDate },
      }),
      Milestone.countDocuments({
        userId: userObjId,
        status: "COMPLETED",
        updatedAt: { $gte: startDate, $lte: endDate },
      }),
      Goal.find({ userId: userObjId, status: "IN_PROGRESS" }).select("_id title progress").limit(10),
    ]);

    const stats = goalsAgg[0] || {};

    return {
      totalGoals: stats.totalGoals || 0,
      activeGoals: stats.activeGoals || 0,
      completedGoals: stats.completedGoals || 0,
      averageProgress: Math.round(stats.averageProgress || 0),
      goalsByCategory: categoryAgg.map((c) => ({ category: c._id, count: c.count })),
      goalsByStatus: statusAgg.map((s) => ({ status: s._id, count: s.count })),
      milestoneStats: {
        total: milestoneTotal,
        completed: milestoneCompleted,
        completionRate: milestoneTotal > 0 ? Math.round((milestoneCompleted / milestoneTotal) * 100) : 0,
      },
      goalsProgress: goalsList.map((g) => ({
        goalId: g._id.toString(),
        title: g.title,
        progress: g.progress,
      })),
    };
  }

  async getFocusStats(userId: string, startDate: Date, endDate: Date) {
    const userObjId = new Types.ObjectId(userId);

    const [statsAgg, modeAgg, taskAgg, goalAgg] = await Promise.all([
      FocusSession.aggregate([
        {
          $match: {
            userId: userObjId,
            status: FocusStatus.COMPLETED,
            startedAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalFocusSeconds: { $sum: "$actualDuration" },
            completedSessions: { $sum: 1 },
            averageSessionSeconds: { $avg: "$actualDuration" },
            longestSessionSeconds: { $max: "$actualDuration" },
          },
        },
      ]),
      FocusSession.aggregate([
        {
          $match: {
            userId: userObjId,
            status: FocusStatus.COMPLETED,
            startedAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$mode",
            seconds: { $sum: "$actualDuration" },
            count: { $sum: 1 },
          },
        },
      ]),
      FocusSession.aggregate([
        {
          $match: {
            userId: userObjId,
            status: FocusStatus.COMPLETED,
            startedAt: { $gte: startDate, $lte: endDate },
            taskId: { $ne: null },
          },
        },
        {
          $group: {
            _id: "$taskId",
            seconds: { $sum: "$actualDuration" },
          },
        },
        { $sort: { seconds: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "tasks",
            localField: "_id",
            foreignField: "_id",
            as: "task",
          },
        },
        { $unwind: "$task" },
      ]),
      FocusSession.aggregate([
        {
          $match: {
            userId: userObjId,
            status: FocusStatus.COMPLETED,
            startedAt: { $gte: startDate, $lte: endDate },
            goalId: { $ne: null },
          },
        },
        {
          $group: {
            _id: "$goalId",
            seconds: { $sum: "$actualDuration" },
          },
        },
        { $sort: { seconds: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "goals",
            localField: "_id",
            foreignField: "_id",
            as: "goal",
          },
        },
        { $unwind: "$goal" },
      ]),
    ]);

    const stats = statsAgg[0] || {};

    return {
      totalFocusSeconds: Math.round(stats.totalFocusSeconds || 0),
      completedSessions: stats.completedSessions || 0,
      averageSessionSeconds: Math.round(stats.averageSessionSeconds || 0),
      longestSessionSeconds: stats.longestSessionSeconds || 0,
      focusByMode: modeAgg.map((m) => ({ mode: m._id, seconds: m.seconds, count: m.count })),
      focusByTask: taskAgg.map((t) => ({ taskId: t._id.toString(), title: t.task.title, seconds: t.seconds })),
      focusByGoal: goalAgg.map((g) => ({ goalId: g._id.toString(), title: g.goal.title, seconds: g.seconds })),
    };
  }

  async getCalendarStats(userId: string, startDate: Date, endDate: Date) {
    const userObjId = new Types.ObjectId(userId);

    const [statsAgg, typeAgg] = await Promise.all([
      CalendarEvent.aggregate([
        {
          $match: {
            userId: userObjId,
            startDateTime: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalEvents: { $sum: 1 },
            completedEvents: {
              $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
            },
            cancelledEvents: {
              $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] },
            },
          },
        },
      ]),
      CalendarEvent.aggregate([
        {
          $match: {
            userId: userObjId,
            startDateTime: { $gte: startDate, $lte: endDate },
          },
        },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
    ]);

    const stats = statsAgg[0] || {};

    return {
      totalEvents: stats.totalEvents || 0,
      completedEvents: stats.completedEvents || 0,
      cancelledEvents: stats.cancelledEvents || 0,
      eventsByType: typeAgg.map((t) => ({ type: t._id, count: t.count })),
    };
  }

  async getDailyTrends(userId: string, startDate: Date, endDate: Date) {
    const userObjId = new Types.ObjectId(userId);

    const [taskCreatedTrend, taskCompletedTrend, focusTrend, txTrend, eventTrend] = await Promise.all([
      Task.aggregate([
        {
          $match: {
            userId: userObjId,
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
      Task.aggregate([
        {
          $match: {
            userId: userObjId,
            status: "COMPLETED",
            updatedAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
      FocusSession.aggregate([
        {
          $match: {
            userId: userObjId,
            status: FocusStatus.COMPLETED,
            startedAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
            focusSeconds: { $sum: "$actualDuration" },
            sessionsCount: { $sum: 1 },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: userObjId,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              type: "$type",
            },
            totalPaise: { $sum: "$amount" },
          },
        },
      ]),
      CalendarEvent.aggregate([
        {
          $match: {
            userId: userObjId,
            startDateTime: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$startDateTime" } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Build a map of dates across the range
    const trendMap: Record<
      string,
      {
        tasksCompleted: number;
        tasksCreated: number;
        focusSeconds: number;
        sessionsCount: number;
        income: number;
        expenses: number;
        eventsCount: number;
      }
    > = {};

    const cur = new Date(startDate);
    while (cur <= endDate) {
      const dateKey = cur.toISOString().split("T")[0];
      trendMap[dateKey] = {
        tasksCompleted: 0,
        tasksCreated: 0,
        focusSeconds: 0,
        sessionsCount: 0,
        income: 0,
        expenses: 0,
        eventsCount: 0,
      };
      cur.setDate(cur.getDate() + 1);
    }

    for (const item of taskCreatedTrend) {
      if (trendMap[item._id]) trendMap[item._id].tasksCreated = item.count;
    }
    for (const item of taskCompletedTrend) {
      if (trendMap[item._id]) trendMap[item._id].tasksCompleted = item.count;
    }
    for (const item of focusTrend) {
      if (trendMap[item._id]) {
        trendMap[item._id].focusSeconds = item.focusSeconds;
        trendMap[item._id].sessionsCount = item.sessionsCount;
      }
    }
    for (const item of txTrend) {
      const dateKey = item._id.date;
      if (trendMap[dateKey]) {
        if (item._id.type === "INCOME") trendMap[dateKey].income = item.totalPaise / 100;
        if (item._id.type === "EXPENSE") trendMap[dateKey].expenses = item.totalPaise / 100;
      }
    }
    for (const item of eventTrend) {
      if (trendMap[item._id]) trendMap[item._id].eventsCount = item.count;
    }

    return Object.entries(trendMap).map(([date, data]) => ({
      date,
      ...data,
    }));
  }
}
