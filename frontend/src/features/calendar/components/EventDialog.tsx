import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { X, Loader2, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  CalendarEvent,
  EventType,
  EventStatus,
  CreateCalendarEventInput,
} from "../types/calendar";
import { getTasksApi } from "@/features/tasks/services/task.service";
import { goalService } from "@/features/goals/services/goalService";

const eventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Event title is required")
      .max(200, "Title cannot exceed 200 characters"),
    description: z
      .string()
      .trim()
      .max(2000, "Description cannot exceed 2000 characters")
      .optional(),
    type: z.enum(["MEETING", "TASK", "DEADLINE", "PERSONAL", "REMINDER", "OTHER"]),
    startDateTime: z.string().min(1, "Start date & time is required"),
    endDateTime: z.string().min(1, "End date & time is required"),
    allDay: z.boolean().optional(),
    timezone: z.string().optional(),
    location: z.string().trim().max(300).optional(),
    color: z.string().optional().nullable(),
    status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]),
    taskId: z.string().optional().nullable(),
    goalId: z.string().optional().nullable(),
    milestoneId: z.string().optional().nullable(),
    reminderEnabled: z.boolean().optional(),
    reminderMinutes: z.number().optional(),
  })
  .refine(
    (data) => {
      if (data.startDateTime && data.endDateTime) {
        return new Date(data.endDateTime) >= new Date(data.startDateTime);
      }
      return true;
    },
    {
      message: "End date and time cannot be before start date and time",
      path: ["endDateTime"],
    }
  );

type EventFormData = z.infer<typeof eventFormSchema>;

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCalendarEventInput) => Promise<void>;
  eventToEdit?: CalendarEvent | null;
  initialDates?: { start: string; end: string } | null;
  isLoading?: boolean;
}

const EVENT_TYPES: EventType[] = [
  "MEETING",
  "TASK",
  "DEADLINE",
  "PERSONAL",
  "REMINDER",
  "OTHER",
];

const PRESET_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Emerald", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Rose", value: "#ef4444" },
  { name: "Indigo", value: "#6366f1" },
];

export function EventDialog({
  isOpen,
  onClose,
  onSubmit,
  eventToEdit,
  initialDates,
  isLoading,
}: EventDialogProps) {
  const isEditing = !!eventToEdit;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "PERSONAL",
      startDateTime: "",
      endDateTime: "",
      allDay: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      location: "",
      color: "#3b82f6",
      status: "SCHEDULED",
      taskId: "",
      goalId: "",
      milestoneId: "",
      reminderEnabled: false,
      reminderMinutes: 15,
    },
  });

  const selectedGoalId = watch("goalId");
  const selectedColor = watch("color");

  // Fetch tasks for dropdown
  const { data: tasksData } = useQuery({
    queryKey: ["tasks-dropdown"],
    queryFn: async () => {
      const res = await getTasksApi({ limit: 100 });
      return res.data?.tasks || [];
    },
    enabled: isOpen,
  });

  // Fetch goals for dropdown
  const { data: goalsData } = useQuery({
    queryKey: ["goals-dropdown"],
    queryFn: async () => {
      const res = await goalService.getGoals({ limit: 100 });
      return res.goals || [];
    },
    enabled: isOpen,
  });

  // Fetch milestones for selected goal
  const { data: milestonesData } = useQuery({
    queryKey: ["goal-milestones-dropdown", selectedGoalId],
    queryFn: async () => {
      if (!selectedGoalId) return [];
      return await goalService.getMilestones(selectedGoalId);
    },
    enabled: isOpen && !!selectedGoalId,
  });

  // Format ISO to local datetime-local format (YYYY-MM-DDTHH:mm)
  const formatToLocalInputValue = (isoStr?: string | null) => {
    if (!isoStr) return "";
    const date = new Date(isoStr);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  useEffect(() => {
    if (eventToEdit) {
      reset({
        title: eventToEdit.title,
        description: eventToEdit.description || "",
        type: eventToEdit.type,
        startDateTime: formatToLocalInputValue(eventToEdit.startDateTime),
        endDateTime: formatToLocalInputValue(eventToEdit.endDateTime),
        allDay: eventToEdit.allDay,
        timezone: eventToEdit.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        location: eventToEdit.location || "",
        color: eventToEdit.color || "#3b82f6",
        status: eventToEdit.status,
        taskId: eventToEdit.taskId || "",
        goalId: eventToEdit.goalId || "",
        milestoneId: eventToEdit.milestoneId || "",
        reminderEnabled: eventToEdit.reminder?.enabled || false,
        reminderMinutes: eventToEdit.reminder?.minutesBefore || 15,
      });
    } else if (initialDates) {
      reset({
        title: "",
        description: "",
        type: "PERSONAL",
        startDateTime: formatToLocalInputValue(initialDates.start),
        endDateTime: formatToLocalInputValue(initialDates.end),
        allDay: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        location: "",
        color: "#3b82f6",
        status: "SCHEDULED",
        taskId: "",
        goalId: "",
        milestoneId: "",
        reminderEnabled: false,
        reminderMinutes: 15,
      });
    } else {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      reset({
        title: "",
        description: "",
        type: "PERSONAL",
        startDateTime: formatToLocalInputValue(now.toISOString()),
        endDateTime: formatToLocalInputValue(oneHourLater.toISOString()),
        allDay: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        location: "",
        color: "#3b82f6",
        status: "SCHEDULED",
        taskId: "",
        goalId: "",
        milestoneId: "",
        reminderEnabled: false,
        reminderMinutes: 15,
      });
    }
  }, [eventToEdit, initialDates, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: EventFormData) => {
    const payload: CreateCalendarEventInput = {
      title: data.title,
      description: data.description,
      type: data.type as EventType,
      startDateTime: new Date(data.startDateTime).toISOString(),
      endDateTime: new Date(data.endDateTime).toISOString(),
      allDay: data.allDay,
      timezone: data.timezone,
      location: data.location,
      color: data.color,
      status: data.status as EventStatus,
      taskId: data.taskId ? data.taskId : null,
      goalId: data.goalId ? data.goalId : null,
      milestoneId: data.milestoneId ? data.milestoneId : null,
      reminder: data.reminderEnabled
        ? {
          enabled: true,
          minutesBefore: Number(data.reminderMinutes || 15),
          reminderType: "POPUP",
        }
        : null,
    };

    await onSubmit(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              {isEditing ? "Edit Calendar Event" : "Schedule New Event"}
            </CardTitle>
            <CardDescription className="text-xs">
              {isEditing
                ? "Update event details, timing, or linked goals & tasks."
                : "Add a meeting, deadline, or task reminder to your schedule."}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <CardContent className="space-y-4 p-5 overflow-y-auto flex-1">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Event Title <span className="text-destructive">*</span>
              </label>
              <input
                {...register("title")}
                type="text"
                placeholder="e.g. Q3 Sprint Planning Meeting"
                className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {errors.title && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Type & Status Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Event Type
                </label>
                <select
                  {...register("type")}
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Status
                </label>
                <select
                  {...register("status")}
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Start & End Date Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Start Date & Time <span className="text-destructive">*</span>
                </label>
                <input
                  {...register("startDateTime")}
                  type="datetime-local"
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                {errors.startDateTime && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.startDateTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  End Date & Time <span className="text-destructive">*</span>
                </label>
                <input
                  {...register("endDateTime")}
                  type="datetime-local"
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                {errors.endDateTime && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.endDateTime.message}
                  </p>
                )}
              </div>
            </div>

            {/* All Day Toggle & Location */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  {...register("allDay")}
                  type="checkbox"
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <span>All-Day Event</span>
              </label>

              <div className="flex-1 max-w-xs space-y-1">
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    {...register("location")}
                    type="text"
                    placeholder="Location / Zoom link..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            </div>

            {/* Color Accent Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Event Color Accent
              </label>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setValue("color", c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`h-6 w-6 rounded-full transition-transform ${selectedColor === c.value
                        ? "ring-2 ring-offset-2 ring-primary scale-110"
                        : "opacity-80 hover:opacity-100"
                      }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Description & Agenda
              </label>
              <textarea
                {...register("description")}
                rows={2}
                placeholder="Meeting notes, agenda items, or reminders..."
                className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>

            {/* Related Goal & Milestone Dropdowns */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Link Related Goal
                </label>
                <select
                  {...register("goalId")}
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">-- None (Independent) --</option>
                  {(goalsData || []).map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.title} ({g.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Link Milestone
                </label>
                <select
                  {...register("milestoneId")}
                  disabled={!selectedGoalId}
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                >
                  <option value="">-- None --</option>
                  {(milestonesData || []).map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Related Task Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Link Related Task
              </label>
              <select
                {...register("taskId")}
                className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">-- None --</option>
                {(tasksData || []).map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title} ({t.status})
                  </option>
                ))}
              </select>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-end gap-2 p-4 border-t bg-muted/20">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Event"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
