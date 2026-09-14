import { useState, useEffect } from "react";
import {
  User,
  Globe,
  Bell,
  Timer,
  Calendar as CalendarIcon,
  Palette,
  Save,
  RotateCcw,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { useUserSettings, useUpdateSettings, useResetSettings } from "@/features/settings/hooks/useSettings";
import { ResetSettingsModal } from "@/features/settings/components/ResetSettingsModal";
import type { IUserPreferences } from "@/features/settings/types/settings";

const COMMON_TIMEZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
  "UTC",
];

const CURRENCIES = [
  { code: "INR", label: "INR (₹) - Indian Rupee" },
  { code: "USD", label: "USD ($) - US Dollar" },
  { code: "EUR", label: "EUR (€) - Euro" },
  { code: "GBP", label: "GBP (£) - British Pound" },
  { code: "CAD", label: "CAD ($) - Canadian Dollar" },
  { code: "AUD", label: "AUD ($) - Australian Dollar" },
];

export default function Settings() {
  const { setTheme } = useTheme();
  const { data: userSettings, isLoading, isError } = useUserSettings();
  const updateSettingsMutation = useUpdateSettings();
  const resetSettingsMutation = useResetSettings();

  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "notifications" | "focus" | "calendar">("profile");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [preferences, setPreferences] = useState<IUserPreferences | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Hydrate form from API userSettings
  useEffect(() => {
    if (userSettings) {
      setName(userSettings.name || "");
      setAvatarUrl(userSettings.avatarUrl || "");
      setPreferences(userSettings.preferences);
      setHasUnsavedChanges(false);
    }
  }, [userSettings]);

  const handlePreferenceChange = <K extends keyof IUserPreferences>(
    key: K,
    value: IUserPreferences[K]
  ) => {
    if (!preferences) return;
    setPreferences((prev) => (prev ? { ...prev, [key]: value } : prev));
    setHasUnsavedChanges(true);

    // Sync theme with ThemeContext immediately
    if (key === "theme") {
      setTheme(value as "light" | "dark" | "system");
    }
  };

  const handleNestedChange = <
    K extends "notifications" | "focus" | "calendar",
    NK extends keyof IUserPreferences[K]
  >(
    section: K,
    key: NK,
    value: IUserPreferences[K][NK]
  ) => {
    if (!preferences) return;
    setPreferences((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (!preferences) return;
    updateSettingsMutation.mutate(
      {
        name,
        avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : null,
        preferences,
      },
      {
        onSuccess: () => {
          setHasUnsavedChanges(false);
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 3000);
        },
      }
    );
  };

  const handleConfirmReset = () => {
    resetSettingsMutation.mutate(undefined, {
      onSuccess: (data) => {
        setIsResetModalOpen(false);
        setPreferences(data.preferences);
        setTheme(data.preferences.theme);
        setHasUnsavedChanges(false);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading preferences...</span>
      </div>
    );
  }

  if (isError || !preferences) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertCircle className="w-10 h-10 mx-auto text-destructive" />
        <h3 className="text-base font-semibold text-foreground">Failed to load settings</h3>
        <p className="text-xs text-muted-foreground">Please check your internet connection and refresh.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header & Save Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings & Preferences</h1>
          <p className="text-xs text-muted-foreground">
            Customize display, timezone, notifications, focus timer, and calendar options.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
            className="text-xs gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || updateSettingsMutation.isPending}
            className="text-xs gap-1.5 bg-primary text-primary-foreground font-medium"
          >
            {updateSettingsMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Success Toast Banner */}
      {showSuccessToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="flex items-center">
            <Check className="w-4 h-4 mr-2" /> Preferences saved successfully!
          </span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-border overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === "profile"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === "preferences"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Regional & Appearance</span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === "notifications"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab("focus")}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === "focus"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>Focus Timer</span>
        </button>

        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === "calendar"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Calendar</span>
        </button>
      </div>

      {/* Tab Sections */}
      <div className="space-y-6">
        {/* 1. PROFILE TAB */}
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription className="text-xs">
                Manage your public display name and avatar details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email Address</label>
                <input
                  type="email"
                  value={userSettings?.email || ""}
                  disabled
                  className="w-full h-9 px-3 rounded-lg border border-input bg-muted/50 text-xs text-muted-foreground cursor-not-allowed"
                />
                <p className="text-[11px] text-muted-foreground">Email is tied to your account login.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Avatar Image URL (Optional)</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => {
                    setAvatarUrl(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="https://example.com/avatar.png"
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* 2. REGIONAL & APPEARANCE TAB */}
        {activeTab === "preferences" && (
          <div className="space-y-6 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" /> Appearance & Theme
                </CardTitle>
                <CardDescription className="text-xs">Select your interface color mode.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Button
                    variant={preferences.theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePreferenceChange("theme", "light")}
                    className="text-xs"
                  >
                    Light
                  </Button>
                  <Button
                    variant={preferences.theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePreferenceChange("theme", "dark")}
                    className="text-xs"
                  >
                    Dark
                  </Button>
                  <Button
                    variant={preferences.theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePreferenceChange("theme", "system")}
                    className="text-xs"
                  >
                    System Default
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" /> Regional & Formatting
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure timezone, currency, date, time, and week start boundaries.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Timezone (IANA)</label>
                    <select
                      value={preferences.timezone}
                      onChange={(e) => handlePreferenceChange("timezone", e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-input bg-background text-xs outline-none focus:ring-1 focus:ring-primary"
                    >
                      {COMMON_TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Preferred Currency</label>
                    <select
                      value={preferences.currency}
                      onChange={(e) => handlePreferenceChange("currency", e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-input bg-background text-xs outline-none focus:ring-1 focus:ring-primary"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Date Format</label>
                    <select
                      value={preferences.dateFormat}
                      onChange={(e) => handlePreferenceChange("dateFormat", e.target.value as any)}
                      className="w-full h-9 px-2.5 rounded-lg border border-input bg-background text-xs outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 14/09/2026)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/14/2026)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-14)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Time Format</label>
                    <select
                      value={preferences.timeFormat}
                      onChange={(e) => handlePreferenceChange("timeFormat", e.target.value as any)}
                      className="w-full h-9 px-2.5 rounded-lg border border-input bg-background text-xs outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="12h">12-hour (e.g. 7:30 PM)</option>
                      <option value="24h">24-hour (e.g. 19:30)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Week Starts On</label>
                    <select
                      value={preferences.weekStartsOn}
                      onChange={(e) => handlePreferenceChange("weekStartsOn", e.target.value as any)}
                      className="w-full h-9 px-2.5 rounded-lg border border-input bg-background text-xs outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 3. NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" /> Notification Delivery Controls
              </CardTitle>
              <CardDescription className="text-xs">
                Enable or disable specific notification categories.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div>
                  <h4 className="text-xs font-semibold text-foreground">In-App Notifications</h4>
                  <p className="text-[11px] text-muted-foreground">Master toggle for in-app bell notifications.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifications.inApp}
                  onChange={(e) => handleNestedChange("notifications", "inApp", e.target.checked)}
                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Task Reminders</h4>
                  <p className="text-[11px] text-muted-foreground">Notifications for due tasks and deadlines.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifications.taskReminders}
                  onChange={(e) => handleNestedChange("notifications", "taskReminders", e.target.checked)}
                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Calendar Reminders</h4>
                  <p className="text-[11px] text-muted-foreground">Background worker reminders before calendar events.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifications.calendarReminders}
                  onChange={(e) => handleNestedChange("notifications", "calendarReminders", e.target.checked)}
                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Goal Reminders</h4>
                  <p className="text-[11px] text-muted-foreground">Notifications for upcoming goal target dates.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifications.goalReminders}
                  onChange={(e) => handleNestedChange("notifications", "goalReminders", e.target.checked)}
                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Focus Session Completion</h4>
                  <p className="text-[11px] text-muted-foreground">Alerts when a focus timer session finishes.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifications.focusCompletion}
                  onChange={(e) => handleNestedChange("notifications", "focusCompletion", e.target.checked)}
                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* 4. FOCUS TIMER TAB */}
        {activeTab === "focus" && (
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Timer className="w-4 h-4 text-primary" /> Focus Timer Defaults
              </CardTitle>
              <CardDescription className="text-xs">
                Configure default session and break durations for new Focus sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Focus Duration (mins)</label>
                  <input
                    type="number"
                    min={1}
                    max={240}
                    value={preferences.focus.defaultFocusMinutes}
                    onChange={(e) =>
                      handleNestedChange("focus", "defaultFocusMinutes", parseInt(e.target.value, 10) || 25)
                    }
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Short Break (mins)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={preferences.focus.defaultShortBreakMinutes}
                    onChange={(e) =>
                      handleNestedChange("focus", "defaultShortBreakMinutes", parseInt(e.target.value, 10) || 5)
                    }
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Long Break (mins)</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={preferences.focus.defaultLongBreakMinutes}
                    onChange={(e) =>
                      handleNestedChange("focus", "defaultLongBreakMinutes", parseInt(e.target.value, 10) || 15)
                    }
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-border">
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Auto-start Breaks</h4>
                  <p className="text-[11px] text-muted-foreground">Automatically start break timer when focus session finishes.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.focus.autoStartBreak}
                  onChange={(e) => handleNestedChange("focus", "autoStartBreak", e.target.checked)}
                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* 5. CALENDAR TAB */}
        {activeTab === "calendar" && (
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" /> Calendar Defaults
              </CardTitle>
              <CardDescription className="text-xs">
                Set default view and event duration preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Default Calendar View</label>
                  <select
                    value={preferences.calendar.defaultView}
                    onChange={(e) => handleNestedChange("calendar", "defaultView", e.target.value as any)}
                    className="w-full h-9 px-2.5 rounded-lg border border-input bg-background text-xs outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="month">Month View</option>
                    <option value="week">Week View</option>
                    <option value="day">Day View</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Default Event Duration (mins)</label>
                  <input
                    type="number"
                    min={5}
                    max={1440}
                    value={preferences.calendar.defaultEventDuration}
                    onChange={(e) =>
                      handleNestedChange("calendar", "defaultEventDuration", parseInt(e.target.value, 10) || 30)
                    }
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      <ResetSettingsModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        isPending={resetSettingsMutation.isPending}
      />
    </div>
  );
}
