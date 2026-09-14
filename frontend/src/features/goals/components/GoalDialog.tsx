import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Sparkles } from "lucide-react";
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
  Goal,
  GoalCategory,
  GoalStatus,
  GoalPriority,
  CreateGoalInput,
} from "../types/goal";

const goalFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Goal title is required")
      .max(200, "Title cannot exceed 200 characters"),
    description: z
      .string()
      .trim()
      .max(2000, "Description cannot exceed 2000 characters")
      .optional(),
    category: z.enum([
      "CAREER",
      "LEARNING",
      "FINANCE",
      "HEALTH",
      "PERSONAL",
      "PROJECT",
      "OTHER",
    ]),
    status: z.enum([
      "NOT_STARTED",
      "IN_PROGRESS",
      "COMPLETED",
      "ON_HOLD",
      "CANCELLED",
    ]),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    startDate: z.string().optional(),
    targetDate: z.string().optional(),
    progress: z
      .number()
      .min(0, "Progress must be at least 0")
      .max(100, "Progress cannot exceed 100"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.targetDate) {
        return new Date(data.targetDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "Target date cannot be before start date",
      path: ["targetDate"],
    }
  );

type GoalFormData = z.infer<typeof goalFormSchema>;

interface GoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGoalInput) => Promise<void>;
  goalToEdit?: Goal | null;
  isLoading?: boolean;
}

const CATEGORIES: GoalCategory[] = [
  "CAREER",
  "LEARNING",
  "FINANCE",
  "HEALTH",
  "PERSONAL",
  "PROJECT",
  "OTHER",
];

const STATUSES: GoalStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",
];

const PRIORITIES: GoalPriority[] = ["LOW", "MEDIUM", "HIGH"];

export function GoalDialog({
  isOpen,
  onClose,
  onSubmit,
  goalToEdit,
  isLoading,
}: GoalDialogProps) {
  const isEditing = !!goalToEdit;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "PERSONAL",
      status: "NOT_STARTED",
      priority: "MEDIUM",
      startDate: "",
      targetDate: "",
      progress: 0,
    },
  });

  useEffect(() => {
    if (goalToEdit) {
      reset({
        title: goalToEdit.title,
        description: goalToEdit.description || "",
        category: goalToEdit.category,
        status: goalToEdit.status,
        priority: goalToEdit.priority,
        startDate: goalToEdit.startDate
          ? new Date(goalToEdit.startDate).toISOString().substring(0, 10)
          : "",
        targetDate: goalToEdit.targetDate
          ? new Date(goalToEdit.targetDate).toISOString().substring(0, 10)
          : "",
        progress: goalToEdit.progress || 0,
      });
    } else {
      reset({
        title: "",
        description: "",
        category: "PERSONAL",
        status: "NOT_STARTED",
        priority: "MEDIUM",
        startDate: "",
        targetDate: "",
        progress: 0,
      });
    }
  }, [goalToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: GoalFormData) => {
    const payload: CreateGoalInput = {
      title: data.title,
      description: data.description,
      category: data.category as GoalCategory,
      status: data.status as GoalStatus,
      priority: data.priority as GoalPriority,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      targetDate: data.targetDate ? new Date(data.targetDate).toISOString() : null,
      progress: Number(data.progress),
    };

    await onSubmit(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {isEditing ? "Edit Goal" : "New Goal"}
            </CardTitle>
            <CardDescription className="text-xs">
              {isEditing
                ? "Update your long-term objective details."
                : "Set a new long-term objective and define your target."}
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
              <label className="text-xs font-semibold text-foreground">
                Goal Title <span className="text-destructive">*</span>
              </label>
              <input
                {...register("title")}
                type="text"
                placeholder="e.g. Become a Full Stack Developer"
                className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {errors.title && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Outline why this goal is important and key outcomes..."
                className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
              {errors.description && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Category & Priority Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  {...register("category")}
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Priority <span className="text-destructive">*</span>
                </label>
                <select
                  {...register("priority")}
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {PRIORITIES.map((pri) => (
                    <option key={pri} value={pri}>
                      {pri}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status & Progress Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Status <span className="text-destructive">*</span>
                </label>
                <select
                  {...register("status")}
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Progress (%)
                </label>
                <input
                  {...register("progress", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0 - 100"
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                />
                {errors.progress && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.progress.message}
                  </p>
                )}
              </div>
            </div>

            {/* Start Date & Target Date Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Start Date
                </label>
                <input
                  {...register("startDate")}
                  type="date"
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Target Date
                </label>
                <input
                  {...register("targetDate")}
                  type="date"
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                {errors.targetDate && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.targetDate.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-end gap-2 p-4 border-t bg-muted/20">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Goal"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
