export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum TaskCategory {
  WORK = "Work",
  PERSONAL = "Personal",
  LEARNING = "Learning",
  HEALTH = "Health",
  FINANCE = "Finance",
  OTHER = "Other",
}

export enum RecurrenceFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
}

export interface ISubtask {
  _id?: string;
  title: string;
  completed: boolean;
}

export interface IRecurrence {
  frequency: RecurrenceFrequency;
  interval: number;
}
