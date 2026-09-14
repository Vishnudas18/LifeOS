import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Layers } from "lucide-react";
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
  Milestone,
  MilestoneStatus,
  CreateMilestoneInput,
} from "../types/goal";

const milestoneFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Milestone title is required")
    .max(200, "Title cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
  dueDate: z.string().optional(),
  order: z.number().min(0, "Order must be 0 or greater").optional(),
});

type MilestoneFormData = z.infer<typeof milestoneFormSchema>;

interface MilestoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMilestoneInput) => Promise<void>;
  milestoneToEdit?: Milestone | null;
  isLoading?: boolean;
}

export function MilestoneDialog({
  isOpen,
  onClose,
  onSubmit,
  milestoneToEdit,
  isLoading,
}: MilestoneDialogProps) {
  const isEditing = !!milestoneToEdit;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "PENDING",
      dueDate: "",
      order: 0,
    },
  });

  useEffect(() => {
    if (milestoneToEdit) {
      reset({
        title: milestoneToEdit.title,
        description: milestoneToEdit.description || "",
        status: milestoneToEdit.status,
        dueDate: milestoneToEdit.dueDate
          ? new Date(milestoneToEdit.dueDate).toISOString().substring(0, 10)
          : "",
        order: milestoneToEdit.order || 0,
      });
    } else {
      reset({
        title: "",
        description: "",
        status: "PENDING",
        dueDate: "",
        order: 0,
      });
    }
  }, [milestoneToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: MilestoneFormData) => {
    const payload: CreateMilestoneInput = {
      title: data.title,
      description: data.description,
      status: data.status as MilestoneStatus,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      order: Number(data.order),
    };

    await onSubmit(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              {isEditing ? "Edit Milestone" : "Add Milestone"}
            </CardTitle>
            <CardDescription className="text-xs">
              {isEditing
                ? "Update milestone title, due date, or status."
                : "Break your goal down into actionable checkpoints."}
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

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <CardContent className="space-y-4 p-5">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Milestone Title <span className="text-destructive">*</span>
              </label>
              <input
                {...register("title")}
                type="text"
                placeholder="e.g. Build API Endpoints"
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
                rows={2}
                placeholder="Details or deliverables for this milestone..."
                className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>

            {/* Status & Order Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Status
                </label>
                <select
                  {...register("status")}
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Sort Order
                </label>
                <input
                  {...register("order", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Target Due Date
              </label>
              <input
                {...register("dueDate")}
                type="date"
                className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
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
              {isEditing ? "Save Changes" : "Add Milestone"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
