export enum EventType {
  MEETING = "MEETING",
  TASK = "TASK",
  DEADLINE = "DEADLINE",
  PERSONAL = "PERSONAL",
  REMINDER = "REMINDER",
  OTHER = "OTHER",
}

export enum EventStatus {
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum RecurrenceFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export interface IRecurrenceConfig {
  frequency: RecurrenceFrequency;
  interval?: number;
  daysOfWeek?: number[];
  until?: Date | null;
  count?: number | null;
}

export interface IReminderConfig {
  enabled: boolean;
  minutesBefore: number;
  reminderType?: string;
}

export interface ICalendarQueryFilters {
  start?: string;
  end?: string;
  type?: EventType;
  status?: EventStatus;
  search?: string;
}

export interface ICreateCalendarEventInput {
  title: string;
  description?: string;
  type?: EventType;
  startDateTime: string;
  endDateTime: string;
  allDay?: boolean;
  timezone?: string;
  location?: string;
  color?: string;
  status?: EventStatus;
  taskId?: string | null;
  goalId?: string | null;
  milestoneId?: string | null;
  recurrence?: IRecurrenceConfig | null;
  reminder?: IReminderConfig | null;
}

export type IUpdateCalendarEventInput = Partial<ICreateCalendarEventInput>;
