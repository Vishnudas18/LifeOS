import { Schema, model, Document, Types } from "mongoose";
import {
  TaskStatus,
  TaskPriority,
  TaskCategory,
  RecurrenceFrequency,
  IRecurrence,
} from "../types/task.types.js";

export interface ISubtaskDoc {
  _id: Types.ObjectId;
  title: string;
  completed: boolean;
}

export interface ITask extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  goalId?: Types.ObjectId | null;
  milestoneId?: Types.ObjectId | null;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | null;
  startDate?: Date | null;
  completedAt?: Date | null;
  category: string;
  tags: string[];
  subtasks: ISubtaskDoc[];
  isRecurring: boolean;
  recurrence?: IRecurrence | null;
  createdAt: Date;
  updatedAt: Date;
}

const subtaskSchema = new Schema<ISubtaskDoc>(
  {
    title: {
      type: String,
      required: [true, "Subtask title is required"],
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const recurrenceSchema = new Schema<IRecurrence>(
  {
    frequency: {
      type: String,
      enum: Object.values(RecurrenceFrequency),
      required: true,
    },
    interval: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const taskSchema = new Schema<ITask>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [1, "Task title cannot be empty"],
      maxlength: [200, "Task title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    category: {
      type: String,
      default: TaskCategory.PERSONAL,
      trim: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    subtasks: {
      type: [subtaskSchema],
      default: [],
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrence: {
      type: recurrenceSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user-isolated queries
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, goalId: 1 });
taskSchema.index({ userId: 1, milestoneId: 1 });

// Text index for search functionality
taskSchema.index({
  title: "text",
  description: "text",
  category: "text",
  tags: "text",
});

export const Task = model<ITask>("Task", taskSchema);
