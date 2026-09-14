import { FilterQuery, SortOrder, Types } from "mongoose";
import { Goal, IGoalDoc } from "../models/Goal.js";
import { CreateGoalInput, UpdateGoalInput, GoalQueryInput } from "../validators/goal.validator.js";

export class GoalRepository {
  private buildQuery(userId: string, filters: GoalQueryInput): FilterQuery<IGoalDoc> {
    const query: FilterQuery<IGoalDoc> = {
      userId: new Types.ObjectId(userId),
    };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      if (!isNaN(start.getTime())) {
        query.startDate = { $gte: start };
      }
    }

    if (filters.targetDate) {
      const target = new Date(filters.targetDate);
      if (!isNaN(target.getTime())) {
        query.targetDate = { $lte: target };
      }
    }

    return query;
  }

  async createGoal(userId: string, input: CreateGoalInput): Promise<IGoalDoc> {
    const goal = new Goal({
      ...input,
      userId: new Types.ObjectId(userId),
      startDate: input.startDate ? new Date(input.startDate) : null,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
    });
    return await goal.save();
  }

  async findGoalById(userId: string, goalId: string): Promise<IGoalDoc | null> {
    if (!Types.ObjectId.isValid(goalId)) return null;
    return await Goal.findOne({
      _id: new Types.ObjectId(goalId),
      userId: new Types.ObjectId(userId),
    });
  }

  async findGoals(userId: string, queryInput: GoalQueryInput) {
    const query = this.buildQuery(userId, queryInput);
    const page = queryInput.page;
    const limit = queryInput.limit;
    const skip = (page - 1) * limit;

    const sortOrder: SortOrder = queryInput.sortOrder === "asc" ? 1 : -1;
    const sortOptions: Record<string, SortOrder> = {
      [queryInput.sortBy]: sortOrder,
    };

    const [goals, total] = await Promise.all([
      Goal.find(query).sort(sortOptions).skip(skip).limit(limit).exec(),
      Goal.countDocuments(query),
    ]);

    return {
      goals,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async updateGoal(userId: string, goalId: string, input: UpdateGoalInput): Promise<IGoalDoc | null> {
    if (!Types.ObjectId.isValid(goalId)) return null;

    const updateData: Record<string, any> = { ...input };
    if (input.startDate !== undefined) {
      updateData.startDate = input.startDate ? new Date(input.startDate) : null;
    }
    if (input.targetDate !== undefined) {
      updateData.targetDate = input.targetDate ? new Date(input.targetDate) : null;
    }

    return await Goal.findOneAndUpdate(
      {
        _id: new Types.ObjectId(goalId),
        userId: new Types.ObjectId(userId),
      },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async deleteGoal(userId: string, goalId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(goalId)) return false;
    const result = await Goal.deleteOne({
      _id: new Types.ObjectId(goalId),
      userId: new Types.ObjectId(userId),
    });
    return result.deletedCount > 0;
  }

  async getSummary(userId: string) {
    const userObjId = new Types.ObjectId(userId);
    const [total, active, completed, onHold] = await Promise.all([
      Goal.countDocuments({ userId: userObjId }),
      Goal.countDocuments({ userId: userObjId, status: "IN_PROGRESS" }),
      Goal.countDocuments({ userId: userObjId, status: "COMPLETED" }),
      Goal.countDocuments({ userId: userObjId, status: "ON_HOLD" }),
    ]);

    return { total, active, completed, onHold };
  }
}
