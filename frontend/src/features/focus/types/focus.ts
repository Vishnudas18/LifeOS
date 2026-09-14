export type FocusMode = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK" | "CUSTOM";
export type FocusStatus = "IDLE" | "RUNNING" | "PAUSED" | "COMPLETED" | "CANCELLED";

export interface FocusSession {
  _id: string;
  userId: string;
  title?: string;
  mode: FocusMode;
  status: FocusStatus;
  plannedDuration: number; // in seconds
  startedAt?: string | null;
  pausedAt?: string | null;
  endedAt?: string | null;
  accumulatedPausedDuration: number; // in seconds
  actualDuration: number; // in seconds
  taskId?: { _id: string; title: string; status: string; priority: string } | string | null;
  goalId?: { _id: string; title: string; category: string; progress: number } | string | null;
  milestoneId?: { _id: string; title: string; isCompleted: boolean } | string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFocusSessionInput {
  title?: string;
  mode?: FocusMode;
  plannedDuration: number; // in seconds
  taskId?: string | null;
  goalId?: string | null;
  milestoneId?: string | null;
  notes?: string;
}

export interface FocusQueryFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  mode?: FocusMode | "ALL";
  status?: FocusStatus | "ALL";
  taskId?: string;
  goalId?: string;
}

export interface FocusSummary {
  totalFocusTime: number; // in seconds
  completedSessions: number;
  averageSessionDuration: number; // in seconds
  longestSession: number; // in seconds
  todayFocusTime: number; // in seconds
  activeSessionInfo?: FocusSession | null;
}
