import type { Task } from "@/features/tasks/types/task";

export type GoalStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
export type GoalPriority = "LOW" | "MEDIUM" | "HIGH";
export type GoalCategory = "CAREER" | "LEARNING" | "FINANCE" | "HEALTH" | "PERSONAL" | "PROJECT" | "OTHER";
export type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface Milestone {
  _id: string;
  goalId: string;
  userId: string;
  title: string;
  description?: string;
  status: MilestoneStatus;
  dueDate?: string | null;
  completedAt?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneStats {
  total: number;
  completed: number;
}

export interface Goal {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  status: GoalStatus;
  priority: GoalPriority;
  startDate?: string | null;
  targetDate?: string | null;
  progress: number;
  color?: string | null;
  icon?: string | null;
  createdAt: string;
  updatedAt: string;
  milestoneStats?: MilestoneStats;
}

export interface GoalSummary {
  total: number;
  active: number;
  completed: number;
  onHold: number;
}

export interface GoalQueryFilters {
  status?: GoalStatus | "ALL";
  category?: GoalCategory | "ALL";
  priority?: GoalPriority | "ALL";
  search?: string;
  startDate?: string;
  targetDate?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "targetDate" | "priority" | "title" | "progress" | "status";
  sortOrder?: "asc" | "desc";
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  category: GoalCategory;
  status?: GoalStatus;
  priority?: GoalPriority;
  startDate?: string | null;
  targetDate?: string | null;
  progress?: number;
  color?: string | null;
  icon?: string | null;
}

export type UpdateGoalInput = Partial<CreateGoalInput>;

export interface CreateMilestoneInput {
  title: string;
  description?: string;
  status?: MilestoneStatus;
  dueDate?: string | null;
  order?: number;
}

export type UpdateMilestoneInput = Partial<CreateMilestoneInput>;

export interface GoalDetailsResponse {
  goal: Goal;
  milestones: Milestone[];
  tasks: Task[];
  stats: {
    totalMilestones: number;
    completedMilestones: number;
    totalTasks: number;
    completedTasks: number;
  };
}
