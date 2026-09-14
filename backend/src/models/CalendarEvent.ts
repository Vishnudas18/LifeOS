import { Schema, model, Document, Types } from "mongoose";
import {
  EventType,
  EventStatus,
  RecurrenceFrequency,
  IRecurrenceConfig,
  IReminderConfig,
} from "../types/calendar.types.js";

export interface ICalendarEventDoc extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  type: EventType;
  startDateTime: Date;
  endDateTime: Date;
  allDay: boolean;
  timezone: string;
  location?: string;
  color?: string;
  status: EventStatus;
  taskId?: Types.ObjectId | null;
  goalId?: Types.ObjectId | null;
  milestoneId?: Types.ObjectId | null;
  recurrence?: IRecurrenceConfig | null;
  reminder?: IReminderConfig | null;
  createdAt: Date;
  updatedAt: Date;
}

const recurrenceSchema = new Schema<IRecurrenceConfig>(
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
    daysOfWeek: {
      type: [Number],
      default: [],
    },
    until: {
      type: Date,
      default: null,
    },
    count: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
);

const reminderSchema = new Schema<IReminderConfig>(
  {
    enabled: {
      type: Boolean,
      default: false,
    },
    minutesBefore: {
      type: Number,
      default: 15,
      min: 0,
    },
    reminderType: {
      type: String,
      default: "POPUP",
    },
  },
  { _id: false }
);

const calendarEventSchema = new Schema<ICalendarEventDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [1, "Event title cannot be empty"],
      maxlength: [200, "Event title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    type: {
      type: String,
      enum: Object.values(EventType),
      default: EventType.PERSONAL,
      index: true,
    },
    startDateTime: {
      type: Date,
      required: [true, "Start date and time is required"],
      index: true,
    },
    endDateTime: {
      type: Date,
      required: [true, "End date and time is required"],
      index: true,
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: "",
      maxlength: [300, "Location cannot exceed 300 characters"],
    },
    color: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.SCHEDULED,
      index: true,
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
    recurrence: {
      type: recurrenceSchema,
      default: null,
    },
    reminder: {
      type: reminderSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user range queries and filtering
calendarEventSchema.index({ userId: 1, startDateTime: 1 });
calendarEventSchema.index({ userId: 1, endDateTime: 1 });
calendarEventSchema.index({ userId: 1, type: 1 });
calendarEventSchema.index({ userId: 1, status: 1 });
calendarEventSchema.index({ userId: 1, taskId: 1 });
calendarEventSchema.index({ userId: 1, goalId: 1 });

export const CalendarEvent = model<ICalendarEventDoc>(
  "CalendarEvent",
  calendarEventSchema
);
