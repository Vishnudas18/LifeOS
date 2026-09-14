import { Schema, model, Document, Types } from "mongoose";
import { MilestoneStatus } from "../types/goal.types.js";

export interface IMilestoneDoc extends Document {
  _id: Types.ObjectId;
  goalId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  status: MilestoneStatus;
  dueDate?: Date | null;
  completedAt?: Date | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestoneDoc>(
  {
    goalId: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Milestone title is required"],
      trim: true,
      minlength: [1, "Milestone title cannot be empty"],
      maxlength: [200, "Milestone title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: Object.values(MilestoneStatus),
      default: MilestoneStatus.PENDING,
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
milestoneSchema.index({ userId: 1, goalId: 1 });
milestoneSchema.index({ goalId: 1, order: 1 });
milestoneSchema.index({ goalId: 1, status: 1 });
milestoneSchema.index({ goalId: 1, dueDate: 1 });

export const Milestone = model<IMilestoneDoc>("Milestone", milestoneSchema);
