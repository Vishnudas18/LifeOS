import {
  Calendar as CalendarIcon,
  CheckSquare,
  Square,
  Pencil,
  Trash2,
  ListChecks,
  Repeat,
} from "lucide-react";
import type { Task, TaskPriority, TaskStatus } from "../types/task";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TaskCardProps {
  task: Task;
  onStatusToggle: (task: Task) => void;
  onSelect: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const priorityColors: Record<TaskPriority, string> = {
  URGENT: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  HIGH: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  MEDIUM: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  LOW: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

const statusColors: Record<TaskStatus, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  IN_PROGRESS: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  TODO: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  BACKLOG: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export function TaskCard({
  task,
  onStatusToggle,
  onSelect,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const isCompleted = task.status === "COMPLETED";
  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-all hover:border-primary/40 hover:shadow-md cursor-pointer",
        isCompleted && "opacity-75 bg-muted/20"
      )}
      onClick={() => onSelect(task)}
    >
      {/* Quick Status Checkbox */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onStatusToggle(task);
        }}
        className="mt-0.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
        aria-label={isCompleted ? "Mark incomplete" : "Mark completed"}
      >
        {isCompleted ? (
          <CheckSquare className="h-5 w-5 text-emerald-500" />
        ) : (
          <Square className="h-5 w-5" />
        )}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h3
            className={cn(
              "font-medium text-sm text-foreground tracking-tight truncate",
              isCompleted && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </h3>

          {/* Priority Badge */}
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border",
              priorityColors[task.priority]
            )}
          >
            {task.priority}
          </span>

          {/* Status Badge */}
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border",
              statusColors[task.status]
            )}
          >
            {task.status.replace("_", " ")}
          </span>

          {/* Recurring Icon */}
          {task.isRecurring && (
            <span className="text-muted-foreground" title="Recurring Task">
              <Repeat className="h-3.5 w-3.5" />
            </span>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Metadata Footer: Category, Tags, Subtasks, Due Date */}
        <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground flex-wrap">
          {/* Category */}
          <span className="font-medium bg-muted px-2 py-0.5 rounded text-foreground/80">
            {task.category}
          </span>

          {/* Subtask Counter */}
          {task.subtasks.length > 0 && (
            <span className="flex items-center gap-1">
              <ListChecks className="h-3.5 w-3.5" />
              <span>
                {completedSubtasksCount} / {task.subtasks.length}
              </span>
            </span>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>{formatDate(task.dueDate)}</span>
            </span>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex items-center gap-1">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-muted-foreground/80"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => onEdit(task)}
          title="Edit Task"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(task)}
          title="Delete Task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
