import { Types } from "mongoose";

export enum FocusMode {
  FOCUS = "FOCUS",
  SHORT_BREAK = "SHORT_BREAK",
  LONG_BREAK = "LONG_BREAK",
  CUSTOM = "CUSTOM",
}

export enum FocusStatus {
  IDLE = "IDLE",
  RUNNING = "RUNNING",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface IFocusSession {
  _id: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  title?: string;
  mode: FocusMode;
  status: FocusStatus;
  plannedDuration: number; // in seconds
  startedAt?: Date | null;
  pausedAt?: Date | null;
  endedAt?: Date | null;
  accumulatedPausedDuration: number; // in seconds
  actualDuration: number; // in seconds
  taskId?: Types.ObjectId | string | null;
  goalId?: Types.ObjectId | string | null;
  milestoneId?: Types.ObjectId | string | null;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFocusSessionInput {
  title?: string;
  mode?: FocusMode;
  plannedDuration: number; // in seconds
  taskId?: string;
  goalId?: string;
  milestoneId?: string;
  notes?: string;
}

export interface FocusQueryFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  mode?: FocusMode;
  status?: FocusStatus;
  taskId?: string;
  goalId?: string;
}

export interface FocusSummary {
  totalFocusTime: number; // in seconds
  completedSessions: number;
  averageSessionDuration: number; // in seconds
  longestSession: number; // in seconds
  todayFocusTime: number; // in seconds
  activeSessionInfo?: IFocusSession | null;
}
