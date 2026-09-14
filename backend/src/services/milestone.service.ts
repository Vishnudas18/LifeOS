import { Types } from "mongoose";
import { MilestoneRepository } from "../repositories/milestone.repository.js";
import { GoalRepository } from "../repositories/goal.repository.js";
import { Task } from "../models/Task.js";
import { CreateMilestoneInput, UpdateMilestoneInput } from "../validators/milestone.validator.js";
import { GoalError } from "./goal.service.js";

export class MilestoneError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = "MilestoneError";
  }
}

export class MilestoneService {
  private milestoneRepository: MilestoneRepository;
  private goalRepository: GoalRepository;

  constructor() {
    this.milestoneRepository = new MilestoneRepository();
    this.goalRepository = new GoalRepository();
  }

  private async verifyGoalOwnership(userId: string, goalId: string) {
    const goal = await this.goalRepository.findGoalById(userId, goalId);
    if (!goal) {
      throw new GoalError("Goal not found", 404);
    }
    return goal;
  }

  async createMilestone(userId: string, goalId: string, input: CreateMilestoneInput) {
    await this.verifyGoalOwnership(userId, goalId);
    return await this.milestoneRepository.createMilestone(userId, goalId, input);
  }

  async getMilestones(userId: string, goalId: string) {
    await this.verifyGoalOwnership(userId, goalId);
    return await this.milestoneRepository.findMilestonesByGoal(userId, goalId);
  }

  async updateMilestone(
    userId: string,
    goalId: string,
    milestoneId: string,
    input: UpdateMilestoneInput
  ) {
    await this.verifyGoalOwnership(userId, goalId);

    const milestone = await this.milestoneRepository.findMilestoneById(userId, goalId, milestoneId);
    if (!milestone) {
      throw new MilestoneError("Milestone not found", 404);
    }

    return await this.milestoneRepository.updateMilestone(userId, goalId, milestoneId, input);
  }

  async deleteMilestone(userId: string, goalId: string, milestoneId: string) {
    await this.verifyGoalOwnership(userId, goalId);

    const milestone = await this.milestoneRepository.findMilestoneById(userId, goalId, milestoneId);
    if (!milestone) {
      throw new MilestoneError("Milestone not found", 404);
    }

    // Detach any tasks assigned to this milestone
    await Task.updateMany(
      {
        userId: new Types.ObjectId(userId),
        milestoneId: new Types.ObjectId(milestoneId),
      },
      {
        $set: { milestoneId: null },
      }
    );

    return await this.milestoneRepository.deleteMilestone(userId, goalId, milestoneId);
  }

  async associateTaskToGoal(
    userId: string,
    taskId: string,
    goalId?: string | null,
    milestoneId?: string | null
  ) {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new MilestoneError("Invalid Task ID", 400);
    }

    const task = await Task.findOne({
      _id: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
    });

    if (!task) {
      throw new MilestoneError("Task not found", 404);
    }

    let targetGoalId: Types.ObjectId | null = null;
    let targetMilestoneId: Types.ObjectId | null = null;

    if (goalId) {
      await this.verifyGoalOwnership(userId, goalId);
      targetGoalId = new Types.ObjectId(goalId);
    }

    if (milestoneId) {
      if (!goalId) {
        throw new MilestoneError("Goal ID is required when specifying a Milestone", 400);
      }

      const milestone = await this.milestoneRepository.findMilestoneById(userId, goalId, milestoneId);
      if (!milestone) {
        throw new MilestoneError("Milestone not found or does not belong to this goal", 400);
      }
      targetMilestoneId = new Types.ObjectId(milestoneId);
    }

    task.goalId = targetGoalId;
    task.milestoneId = targetMilestoneId;
    await task.save();

    return task;
  }
}
