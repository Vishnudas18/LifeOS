import { Schema, model, Document, Types } from "mongoose";
import { IUserPreferences } from "../types/settings.types.js";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string | null;
  preferences: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferencesSchema = new Schema(
  {
    inApp: { type: Boolean, default: true },
    taskReminders: { type: Boolean, default: true },
    calendarReminders: { type: Boolean, default: true },
    goalReminders: { type: Boolean, default: true },
    focusCompletion: { type: Boolean, default: true },
  },
  { _id: false }
);

const focusPreferencesSchema = new Schema(
  {
    defaultFocusMinutes: { type: Number, default: 25, min: 1, max: 240 },
    defaultShortBreakMinutes: { type: Number, default: 5, min: 1, max: 60 },
    defaultLongBreakMinutes: { type: Number, default: 15, min: 1, max: 120 },
    autoStartBreak: { type: Boolean, default: false },
  },
  { _id: false }
);

const calendarPreferencesSchema = new Schema(
  {
    defaultView: {
      type: String,
      enum: ["month", "week", "day"],
      default: "month",
    },
    defaultEventDuration: { type: Number, default: 30, min: 5, max: 1440 },
  },
  { _id: false }
);

export const DEFAULT_USER_PREFERENCES: IUserPreferences = {
  timezone: "Asia/Kolkata",
  locale: "en",
  currency: "INR",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12h",
  weekStartsOn: "Monday",
  theme: "system",
  notifications: {
    inApp: true,
    taskReminders: true,
    calendarReminders: true,
    goalReminders: true,
    focusCompletion: true,
  },
  focus: {
    defaultFocusMinutes: 25,
    defaultShortBreakMinutes: 5,
    defaultLongBreakMinutes: 15,
    autoStartBreak: false,
  },
  calendar: {
    defaultView: "month",
    defaultEventDuration: 30,
  },
};

const userPreferencesSchema = new Schema<IUserPreferences>(
  {
    timezone: { type: String, default: DEFAULT_USER_PREFERENCES.timezone, trim: true },
    locale: { type: String, default: DEFAULT_USER_PREFERENCES.locale, trim: true },
    currency: { type: String, default: DEFAULT_USER_PREFERENCES.currency, uppercase: true, trim: true },
    dateFormat: {
      type: String,
      enum: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"],
      default: DEFAULT_USER_PREFERENCES.dateFormat,
    },
    timeFormat: {
      type: String,
      enum: ["12h", "24h"],
      default: DEFAULT_USER_PREFERENCES.timeFormat,
    },
    weekStartsOn: {
      type: String,
      enum: ["Monday", "Sunday"],
      default: DEFAULT_USER_PREFERENCES.weekStartsOn,
    },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: DEFAULT_USER_PREFERENCES.theme,
    },
    notifications: {
      type: notificationPreferencesSchema,
      default: () => ({ ...DEFAULT_USER_PREFERENCES.notifications }),
    },
    focus: {
      type: focusPreferencesSchema,
      default: () => ({ ...DEFAULT_USER_PREFERENCES.focus }),
    },
    calendar: {
      type: calendarPreferencesSchema,
      default: () => ({ ...DEFAULT_USER_PREFERENCES.calendar }),
    },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    preferences: {
      type: userPreferencesSchema,
      default: () => ({ ...DEFAULT_USER_PREFERENCES }),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const record = ret as Record<string, unknown>;
        delete record.passwordHash;
        delete record.__v;
        return record;
      },
    },
  }
);

export const User = model<IUser>("User", userSchema);
