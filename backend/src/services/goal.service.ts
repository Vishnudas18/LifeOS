import { Types } from "mongoose";
import { GoalRepository } from "../repositories/goal.repository.js";
import { MilestoneRepository } from "../repositories/milestone.repository.js";
import { Task } from "../models/Task.js";
import { CreateGoalInput, UpdateGoalInput, GoalQueryInput } from "../validators/goal.validator.js";

export class GoalError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = "GoalError";
  }
}

export class GoalService {
  private goalRepository: GoalRepository;
  private milestoneRepository: MilestoneRepository;

  constructor() {
    this.goalRepository = new GoalRepository();
    this.milestoneRepository = new MilestoneRepository();
  }

  async createGoal(userId: string, input: CreateGoalInput) {
    return await this.goalRepository.createGoal(userId, input);
  }

  async getGoals(userId: string, queryInput: GoalQueryInput) {
    const result = await this.goalRepository.findGoals(userId, queryInput);
    
    // Attach milestone completion counts to each goal for list overview cards
    const goalsWithStats = await Promise.all(
      result.goals.map(async (goal) => {
        const stats = await this.milestoneRepository.getMilestoneStatsForGoal(
          userId,
          goal._id.toString()
        );
        return {
          ...goal.toObject(),
          milestoneStats: stats,
        };
      })
    );

    const summary = await this.goalRepository.getSummary(userId);

    return {
      goals: goalsWithStats,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      summary,
    };
  }

  async getGoalDetails(userId: string, goalId: string) {
    const goal = await this.goalRepository.findGoalById(userId, goalId);
    if (!goal) {
      throw new GoalError("Goal not found", 404);
    }

    const [milestones, tasks] = await Promise.all([
      this.milestoneRepository.findMilestonesByGoal(userId, goalId),
      Task.find({
        userId: new Types.ObjectId(userId),
        goalId: new Types.ObjectId(goalId),
      }).sort({ createdAt: -1 }),
    ]);

    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(
      (m) => m.status === "COMPLETED"
    ).length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;

    return {
      goal,
      milestones,
      tasks,
      stats: {
        totalMilestones,
        completedMilestones,
        totalTasks,
        completedTasks,
      },
    };
  }

  async updateGoal(userId: string, goalId: string, input: UpdateGoalInput) {
    const goal = await this.goalRepository.findGoalById(userId, goalId);
    if (!goal) {
      throw new GoalError("Goal not found", 404);
    }

    return await this.goalRepository.updateGoal(userId, goalId, input);
  }

  async deleteGoal(userId: string, goalId: string) {
    const goal = await this.goalRepository.findGoalById(userId, goalId);
    if (!goal) {
      throw new GoalError("Goal not found", 404);
    }

    // Safe deletion:
    // 1. Detach all tasks associated with this goal (set goalId = null, milestoneId = null)
    await Task.updateMany(
      {
        userId: new Types.ObjectId(userId),
        goalId: new Types.ObjectId(goalId),
      },
      {
        $set: {
          goalId: null,
          milestoneId: null,
        },
      }
    );

    // 2. Delete all related milestones
    await this.milestoneRepository.deleteMilestonesByGoal(userId, goalId);

    // 3. Delete the goal
    return await this.goalRepository.deleteGoal(userId, goalId);
  }
}
