import { Types } from "mongoose";
import { Milestone, IMilestoneDoc } from "../models/Milestone.js";
import { MilestoneStatus } from "../types/goal.types.js";
import { CreateMilestoneInput, UpdateMilestoneInput } from "../validators/milestone.validator.js";

export class MilestoneRepository {
  async createMilestone(
    userId: string,
    goalId: string,
    input: CreateMilestoneInput
  ): Promise<IMilestoneDoc> {
    const milestone = new Milestone({
      ...input,
      userId: new Types.ObjectId(userId),
      goalId: new Types.ObjectId(goalId),
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      completedAt: input.status === MilestoneStatus.COMPLETED ? new Date() : null,
    });
    return await milestone.save();
  }

  async findMilestonesByGoal(userId: string, goalId: string): Promise<IMilestoneDoc[]> {
    if (!Types.ObjectId.isValid(goalId)) return [];
    return await Milestone.find({
      userId: new Types.ObjectId(userId),
      goalId: new Types.ObjectId(goalId),
    }).sort({ order: 1, createdAt: 1 });
  }

  async findMilestoneById(
    userId: string,
    goalId: string,
    milestoneId: string
  ): Promise<IMilestoneDoc | null> {
    if (!Types.ObjectId.isValid(goalId) || !Types.ObjectId.isValid(milestoneId)) {
      return null;
    }
    return await Milestone.findOne({
      _id: new Types.ObjectId(milestoneId),
      goalId: new Types.ObjectId(goalId),
      userId: new Types.ObjectId(userId),
    });
  }

  async updateMilestone(
    userId: string,
    goalId: string,
    milestoneId: string,
    input: UpdateMilestoneInput
  ): Promise<IMilestoneDoc | null> {
    if (!Types.ObjectId.isValid(goalId) || !Types.ObjectId.isValid(milestoneId)) {
      return null;
    }

    const updateData: Record<string, any> = { ...input };

    if (input.dueDate !== undefined) {
      updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }

    // Business Logic: completion handling
    if (input.status === MilestoneStatus.COMPLETED) {
      updateData.completedAt = new Date();
    } else if (input.status !== undefined) {
      updateData.completedAt = null;
    }

    return await Milestone.findOneAndUpdate(
      {
        _id: new Types.ObjectId(milestoneId),
        goalId: new Types.ObjectId(goalId),
        userId: new Types.ObjectId(userId),
      },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async deleteMilestone(userId: string, goalId: string, milestoneId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(goalId) || !Types.ObjectId.isValid(milestoneId)) {
      return false;
    }
    const result = await Milestone.deleteOne({
      _id: new Types.ObjectId(milestoneId),
      goalId: new Types.ObjectId(goalId),
      userId: new Types.ObjectId(userId),
    });
    return result.deletedCount > 0;
  }

  async deleteMilestonesByGoal(userId: string, goalId: string): Promise<number> {
    if (!Types.ObjectId.isValid(goalId)) return 0;
    const result = await Milestone.deleteMany({
      goalId: new Types.ObjectId(goalId),
      userId: new Types.ObjectId(userId),
    });
    return result.deletedCount;
  }

  async getMilestoneStatsForGoal(userId: string, goalId: string) {
    if (!Types.ObjectId.isValid(goalId)) return { total: 0, completed: 0 };
    const goalObjId = new Types.ObjectId(goalId);
    const userObjId = new Types.ObjectId(userId);

    const [total, completed] = await Promise.all([
      Milestone.countDocuments({ userId: userObjId, goalId: goalObjId }),
      Milestone.countDocuments({
        userId: userObjId,
        goalId: goalObjId,
        status: MilestoneStatus.COMPLETED,
      }),
    ]);

    return { total, completed };
  }
}
