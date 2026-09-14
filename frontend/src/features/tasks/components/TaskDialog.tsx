import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Task, CreateTaskInput } from "../types/task";

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().optional(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "COMPLETED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(), // Comma-separated string
  dueDate: z.string().optional(),
  startDate: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  taskToEdit?: Task | null;
  isLoading?: boolean;
}

export function TaskDialog({
  isOpen,
  onClose,
  onSubmit,
  taskToEdit,
  isLoading,
}: TaskDialogProps) {
  const isEditing = !!taskToEdit;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      category: "Personal",
      tags: "",
      dueDate: "",
      startDate: "",
      isRecurring: false,
      recurrenceFrequency: "WEEKLY",
    },
  });

  const isRecurring = watch("isRecurring");

  useEffect(() => {
    if (taskToEdit) {
      reset({
        title: taskToEdit.title,
        description: taskToEdit.description || "",
        status: taskToEdit.status,
        priority: taskToEdit.priority,
        category: taskToEdit.category,
        tags: taskToEdit.tags ? taskToEdit.tags.join(", ") : "",
        dueDate: taskToEdit.dueDate
          ? new Date(taskToEdit.dueDate).toISOString().substring(0, 10)
          : "",
        startDate: taskToEdit.startDate
          ? new Date(taskToEdit.startDate).toISOString().substring(0, 10)
          : "",
        isRecurring: taskToEdit.isRecurring || false,
        recurrenceFrequency: taskToEdit.recurrence?.frequency || "WEEKLY",
      });
    } else {
      reset({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        category: "Personal",
        tags: "",
        dueDate: "",
        startDate: "",
        isRecurring: false,
        recurrenceFrequency: "WEEKLY",
      });
    }
  }, [taskToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: TaskFormData) => {
    const formattedTags = data.tags
      ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
      : [];

    const formattedInput: CreateTaskInput = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      category: data.category,
      tags: formattedTags,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      isRecurring: data.isRecurring,
      recurrence: data.isRecurring
        ? {
            frequency: data.recurrenceFrequency || "WEEKLY",
            interval: 1,
          }
        : null,
    };

    await onSubmit(formattedInput);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {isEditing ? "Edit Task" : "Create New Task"}
            </CardTitle>
            <CardDescription className="text-xs">
              {isEditing
                ? "Update task details below."
                : "Add a new task to your workspace."}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <CardContent className="space-y-4 p-6 overflow-y-auto flex-1">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Task Title <span className="text-destructive">*</span>
              </label>
              <input
                {...register("title")}
                placeholder="e.g. Finish Life OS backend setup"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.title && (
                <p className="text-[11px] text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Description</label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Add description, notes, or details..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Status</label>
                <select
                  {...register("status")}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="BACKLOG">Backlog</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Priority</label>
                <select
                  {...register("priority")}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Category</label>
                <select
                  {...register("category")}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Learning">Learning</option>
                  <option value="Health">Health</option>
                  <option value="Finance">Finance</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Tags (comma separated)</label>
                <input
                  {...register("tags")}
                  placeholder="react, backend, urgent"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Start Date</label>
                <input
                  type="date"
                  {...register("startDate")}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Due Date</label>
                <input
                  type="date"
                  {...register("dueDate")}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {/* Recurring Toggle */}
            <div className="pt-2 border-t space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  {...register("isRecurring")}
                  className="h-4 w-4 rounded border-input cursor-pointer"
                />
                <label htmlFor="isRecurring" className="text-xs font-medium cursor-pointer">
                  Recurring Task
                </label>
              </div>

              {isRecurring && (
                <div className="pl-6 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Frequency</label>
                  <select
                    {...register("recurrenceFrequency")}
                    className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t p-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-1.5">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Create Task
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
