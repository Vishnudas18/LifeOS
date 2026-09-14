import { Schema, model, Document, Types } from "mongoose";
import { FocusMode, FocusStatus } from "../types/focus.types.js";

export interface IFocusSessionDoc extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title?: string;
  mode: FocusMode;
  status: FocusStatus;
  plannedDuration: number;
  startedAt?: Date | null;
  pausedAt?: Date | null;
  endedAt?: Date | null;
  accumulatedPausedDuration: number;
  actualDuration: number;
  taskId?: Types.ObjectId | null;
  goalId?: Types.ObjectId | null;
  milestoneId?: Types.ObjectId | null;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const focusSessionSchema = new Schema<IFocusSessionDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: "Focus Session",
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    mode: {
      type: String,
      enum: Object.values(FocusMode),
      default: FocusMode.FOCUS,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(FocusStatus),
      default: FocusStatus.RUNNING,
      required: true,
      index: true,
    },
    plannedDuration: {
      type: Number,
      required: [true, "Planned duration is required"],
      min: [1, "Planned duration must be at least 1 second"],
      max: [86400, "Planned duration cannot exceed 24 hours"],
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    pausedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    accumulatedPausedDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
    actualDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
      index: true,
    },
    goalId: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      default: null,
      index: true,
    },
    milestoneId: {
      type: Schema.Types.ObjectId,
      ref: "Milestone",
      default: null,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast lookups and status filtering
focusSessionSchema.index({ userId: 1, status: 1 });
focusSessionSchema.index({ userId: 1, startedAt: -1 });
focusSessionSchema.index({ userId: 1, mode: 1 });

export const FocusSession = model<IFocusSessionDoc>(
  "FocusSession",
  focusSessionSchema
);
