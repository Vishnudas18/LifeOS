export enum GoalStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ON_HOLD = "ON_HOLD",
  CANCELLED = "CANCELLED",
}

export enum GoalPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum GoalCategory {
  CAREER = "CAREER",
  LEARNING = "LEARNING",
  FINANCE = "FINANCE",
  HEALTH = "HEALTH",
  PERSONAL = "PERSONAL",
  PROJECT = "PROJECT",
  OTHER = "OTHER",
}

export enum MilestoneStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export interface IGoalQueryFilters {
  status?: GoalStatus;
  category?: GoalCategory;
  priority?: GoalPriority;
  search?: string;
  startDate?: string;
  targetDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ICreateGoalInput {
  title: string;
  description?: string;
  category: GoalCategory;
  status?: GoalStatus;
  priority?: GoalPriority;
  startDate?: string | null;
  targetDate?: string | null;
  progress?: number;
  color?: string;
  icon?: string;
}

export type IUpdateGoalInput = Partial<ICreateGoalInput>;

export interface ICreateMilestoneInput {
  title: string;
  description?: string;
  status?: MilestoneStatus;
  dueDate?: string | null;
  order?: number;
}

export type IUpdateMilestoneInput = Partial<ICreateMilestoneInput>;
