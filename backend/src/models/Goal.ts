import { Schema, model, Document, Types } from "mongoose";
import {
  GoalStatus,
  GoalPriority,
  GoalCategory,
} from "../types/goal.types.js";

export interface IGoalDoc extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  category: GoalCategory;
  status: GoalStatus;
  priority: GoalPriority;
  startDate?: Date | null;
  targetDate?: Date | null;
  progress: number;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<IGoalDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
      minlength: [1, "Goal title cannot be empty"],
      maxlength: [200, "Goal title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      enum: Object.values(GoalCategory),
      required: [true, "Category is required"],
      default: GoalCategory.PERSONAL,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(GoalStatus),
      default: GoalStatus.NOT_STARTED,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(GoalPriority),
      default: GoalPriority.MEDIUM,
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    targetDate: {
      type: Date,
      default: null,
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be negative"],
      max: [100, "Progress cannot exceed 100"],
    },
    color: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performant query filtering & ordering
goalSchema.index({ userId: 1, createdAt: -1 });
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, category: 1 });
goalSchema.index({ userId: 1, targetDate: 1 });

// Text index for goal search functionality
goalSchema.index({
  title: "text",
  description: "text",
});

export const Goal = model<IGoalDoc>("Goal", goalSchema);
