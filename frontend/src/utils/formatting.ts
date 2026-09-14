import type { IUserPreferences } from "@/features/settings/types/settings";

const DEFAULT_PREFERENCES: IUserPreferences = {
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

/**
 * Formats a Date object or date string according to date format and timezone preferences
 */
export function formatDate(
  dateInput: Date | string | number | null | undefined,
  preferences: Partial<IUserPreferences> = {}
): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const fmt = preferences.dateFormat || DEFAULT_PREFERENCES.dateFormat;
  const tz = preferences.timezone || DEFAULT_PREFERENCES.timezone;

  try {
    const yearFormatter = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: tz });
    const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "2-digit", timeZone: tz });
    const dayFormatter = new Intl.DateTimeFormat("en-US", { day: "2-digit", timeZone: tz });

    const yyyy = yearFormatter.format(date);
    const mm = monthFormatter.format(date);
    const dd = dayFormatter.format(date);

    switch (fmt) {
      case "MM/DD/YYYY":
        return `${mm}/${dd}/${yyyy}`;
      case "YYYY-MM-DD":
        return `${yyyy}-${mm}-${dd}`;
      case "DD/MM/YYYY":
      default:
        return `${dd}/${mm}/${yyyy}`;
    }
  } catch {
    return date.toLocaleDateString();
  }
}

/**
 * Formats a Date object or time string according to time format preference (12h vs 24h)
 */
export function formatTime(
  dateInput: Date | string | number | null | undefined,
  preferences: Partial<IUserPreferences> = {}
): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const is12h = (preferences.timeFormat || DEFAULT_PREFERENCES.timeFormat) === "12h";
  const tz = preferences.timezone || DEFAULT_PREFERENCES.timezone;

  try {
    return new Intl.DateTimeFormat(preferences.locale || "en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: is12h,
      timeZone: tz,
    }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
}

/**
 * Formats date and time combined
 */
export function formatDateTime(
  dateInput: Date | string | number | null | undefined,
  preferences: Partial<IUserPreferences> = {}
): string {
  if (!dateInput) return "";
  const dateStr = formatDate(dateInput, preferences);
  const timeStr = formatTime(dateInput, preferences);
  return `${dateStr} ${timeStr}`.trim();
}

/**
 * Formats financial amounts (stored in smallest currency unit, e.g. paise/cents)
 */
export function formatCurrency(
  amountInSmallestUnit: number,
  overrideCurrency?: string,
  preferences: Partial<IUserPreferences> = {}
): string {
  const currencyCode = overrideCurrency || preferences.currency || DEFAULT_PREFERENCES.currency;
  const locale = preferences.locale || "en-IN";
  const mainUnitAmount = (amountInSmallestUnit || 0) / 100;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(mainUnitAmount);
  } catch {
    return `${currencyCode} ${mainUnitAmount.toFixed(2)}`;
  }
}

/**
 * Returns numeric week start index (0 for Sunday, 1 for Monday)
 */
export function getWeekStartDayNumber(preferences: Partial<IUserPreferences> = {}): 0 | 1 {
  const startDay = preferences.weekStartsOn || DEFAULT_PREFERENCES.weekStartsOn;
  return startDay === "Sunday" ? 0 : 1;
}
