export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskCategory = "Work" | "Personal" | "Learning" | "Health" | "Finance" | "Other";
export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
}

export interface Recurrence {
  frequency: RecurrenceFrequency;
  interval: number;
}

export interface Task {
  _id: string;
  userId: string;
  goalId?: string | null;
  milestoneId?: string | null;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  startDate?: string | null;
  completedAt?: string | null;
  category: string;
  tags: string[];
  subtasks: Subtask[];
  isRecurring: boolean;
  recurrence?: Recurrence | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  tags?: string[];
  dueDate?: string | null;
  startDate?: string | null;
  goalId?: string | null;
  milestoneId?: string | null;
  subtasks?: { title: string; completed?: boolean }[];
  isRecurring?: boolean;
  recurrence?: Recurrence | null;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface TaskQueryFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  search?: string;
  dueDate?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "dueDate" | "priority" | "title" | "status";
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetTasksResponse {
  tasks: Task[];
  pagination: PaginationMeta;
}
