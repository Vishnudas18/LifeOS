export interface INotificationPreferences {
  inApp: boolean;
  taskReminders: boolean;
  calendarReminders: boolean;
  goalReminders: boolean;
  focusCompletion: boolean;
}

export interface IFocusPreferences {
  defaultFocusMinutes: number;
  defaultShortBreakMinutes: number;
  defaultLongBreakMinutes: number;
  autoStartBreak: boolean;
}

export interface ICalendarPreferences {
  defaultView: "month" | "week" | "day";
  defaultEventDuration: number; // in minutes
}

export interface IUserPreferences {
  timezone: string;
  locale: string;
  currency: string;
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  timeFormat: "12h" | "24h";
  weekStartsOn: "Monday" | "Sunday";
  theme: "light" | "dark" | "system";
  notifications: INotificationPreferences;
  focus: IFocusPreferences;
  calendar: ICalendarPreferences;
}

export interface UserSettingsDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  preferences: IUserPreferences;
  createdAt: string;
  updatedAt: string;
}
