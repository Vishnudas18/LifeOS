export type EventType = "MEETING" | "TASK" | "DEADLINE" | "PERSONAL" | "REMINDER" | "OTHER";
export type EventStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";
export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface RecurrenceConfig {
  frequency: RecurrenceFrequency;
  interval?: number;
  daysOfWeek?: number[];
  until?: string | null;
  count?: number | null;
}

export interface ReminderConfig {
  enabled: boolean;
  minutesBefore: number;
  reminderType?: string;
}

export interface CalendarEvent {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  type: EventType;
  startDateTime: string;
  endDateTime: string;
  allDay: boolean;
  timezone: string;
  location?: string;
  color?: string | null;
  status: EventStatus;
  taskId?: string | null;
  goalId?: string | null;
  milestoneId?: string | null;
  recurrence?: RecurrenceConfig | null;
  reminder?: ReminderConfig | null;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarQueryFilters {
  start?: string;
  end?: string;
  type?: EventType | "ALL";
  status?: EventStatus | "ALL";
  search?: string;
}

export interface CreateCalendarEventInput {
  title: string;
  description?: string;
  type?: EventType;
  startDateTime: string;
  endDateTime: string;
  allDay?: boolean;
  timezone?: string;
  location?: string;
  color?: string | null;
  status?: EventStatus;
  taskId?: string | null;
  goalId?: string | null;
  milestoneId?: string | null;
  recurrence?: RecurrenceConfig | null;
  reminder?: ReminderConfig | null;
}

export type UpdateCalendarEventInput = Partial<CreateCalendarEventInput>;
