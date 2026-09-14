import { FilterQuery, Types } from "mongoose";
import { FocusSession, IFocusSessionDoc } from "../models/FocusSession.js";
import { FocusStatus, FocusSummary } from "../types/focus.types.js";
import {
  CreateFocusSessionSchemaInput,
  FocusQuerySchemaInput,
  FocusSummaryQuerySchemaInput,
} from "../validators/focus.validator.js";

export class FocusRepository {
  async createSession(
    userId: string,
    input: CreateFocusSessionSchemaInput
  ): Promise<IFocusSessionDoc> {
    const session = new FocusSession({
      ...input,
      userId: new Types.ObjectId(userId),
      status: FocusStatus.RUNNING,
      startedAt: new Date(),
      taskId: input.taskId ? new Types.ObjectId(input.taskId) : null,
      goalId: input.goalId ? new Types.ObjectId(input.goalId) : null,
      milestoneId: input.milestoneId ? new Types.ObjectId(input.milestoneId) : null,
    });
    return await session.save();
  }

  async findActiveSession(userId: string): Promise<IFocusSessionDoc | null> {
    return await FocusSession.findOne({
      userId: new Types.ObjectId(userId),
      status: { $in: [FocusStatus.RUNNING, FocusStatus.PAUSED] },
    })
      .populate("taskId", "title status priority")
      .populate("goalId", "title category progress")
      .populate("milestoneId", "title isCompleted")
      .exec();
  }

  async findSessionById(
    userId: string,
    sessionId: string
  ): Promise<IFocusSessionDoc | null> {
    if (!Types.ObjectId.isValid(sessionId)) return null;
    return await FocusSession.findOne({
      _id: new Types.ObjectId(sessionId),
      userId: new Types.ObjectId(userId),
    })
      .populate("taskId", "title status priority")
      .populate("goalId", "title category progress")
      .populate("milestoneId", "title isCompleted")
      .exec();
  }

  async updateSession(
    userId: string,
    sessionId: string,
    updateData: Partial<Record<string, any>>
  ): Promise<IFocusSessionDoc | null> {
    if (!Types.ObjectId.isValid(sessionId)) return null;

    return await FocusSession.findOneAndUpdate(
      {
        _id: new Types.ObjectId(sessionId),
        userId: new Types.ObjectId(userId),
      },
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("taskId", "title status priority")
      .populate("goalId", "title category progress")
      .populate("milestoneId", "title isCompleted")
      .exec();
  }

  async findSessions(
    userId: string,
    queryInput: FocusQuerySchemaInput
  ): Promise<{ sessions: IFocusSessionDoc[]; total: number }> {
    const page = queryInput.page || 1;
    const limit = queryInput.limit || 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IFocusSessionDoc> = {
      userId: new Types.ObjectId(userId),
    };

    if (queryInput.mode) {
      filter.mode = queryInput.mode;
    }
    if (queryInput.status) {
      filter.status = queryInput.status;
    }
    if (queryInput.taskId && Types.ObjectId.isValid(queryInput.taskId)) {
      filter.taskId = new Types.ObjectId(queryInput.taskId);
    }
    if (queryInput.goalId && Types.ObjectId.isValid(queryInput.goalId)) {
      filter.goalId = new Types.ObjectId(queryInput.goalId);
    }

    if (queryInput.startDate || queryInput.endDate) {
      filter.startedAt = {};
      if (queryInput.startDate) {
        filter.startedAt.$gte = new Date(queryInput.startDate);
      }
      if (queryInput.endDate) {
        filter.startedAt.$lte = new Date(queryInput.endDate);
      }
    }

    const [sessions, total] = await Promise.all([
      FocusSession.find(filter)
        .sort({ startedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("taskId", "title status priority")
        .populate("goalId", "title category progress")
        .populate("milestoneId", "title isCompleted")
        .exec(),
      FocusSession.countDocuments(filter),
    ]);

    return { sessions, total };
  }

  async getSummaryMetrics(
    userId: string,
    rangeInput: FocusSummaryQuerySchemaInput
  ): Promise<FocusSummary> {
    const userObjectId = new Types.ObjectId(userId);

    // Calculate today's start and end boundaries (UTC)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const matchFilter: FilterQuery<IFocusSessionDoc> = {
      userId: userObjectId,
      status: FocusStatus.COMPLETED,
    };

    if (rangeInput.startDate || rangeInput.endDate) {
      matchFilter.startedAt = {};
      if (rangeInput.startDate) {
        matchFilter.startedAt.$gte = new Date(rangeInput.startDate);
      }
      if (rangeInput.endDate) {
        matchFilter.startedAt.$lte = new Date(rangeInput.endDate);
      }
    }

    // Aggregation for overall completed focus metrics
    const statsAggregation = await FocusSession.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalFocusTime: { $sum: "$actualDuration" },
          completedSessions: { $sum: 1 },
          averageSessionDuration: { $avg: "$actualDuration" },
          longestSession: { $max: "$actualDuration" },
        },
      },
    ]);

    // Aggregation specifically for today's completed focus time
    const todayAggregation = await FocusSession.aggregate([
      {
        $match: {
          userId: userObjectId,
          status: FocusStatus.COMPLETED,
          startedAt: { $gte: startOfToday, $lte: endOfToday },
        },
      },
      {
        $group: {
          _id: null,
          todayFocusTime: { $sum: "$actualDuration" },
        },
      },
    ]);

    const activeSession = await this.findActiveSession(userId);

    const stats = statsAggregation[0] || {};
    const todayStats = todayAggregation[0] || {};

    return {
      totalFocusTime: Math.round(stats.totalFocusTime || 0),
      completedSessions: stats.completedSessions || 0,
      averageSessionDuration: Math.round(stats.averageSessionDuration || 0),
      longestSession: stats.longestSession || 0,
      todayFocusTime: Math.round(todayStats.todayFocusTime || 0),
      activeSessionInfo: activeSession ? (activeSession.toObject() as any) : null,
    };
  }
}
