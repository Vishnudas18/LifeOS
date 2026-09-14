import React, { useState } from "react";
import {
  X,
  Calendar as CalendarIcon,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  ListChecks,
  Pencil,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Task } from "../types/task";
import {
  useTaskDetails,
  useAddSubtask,
  useToggleSubtask,
  useDeleteSubtask,
} from "../hooks/useTasks";
import { cn } from "@/lib/utils";

interface TaskDetailsDialogProps {
  taskId: string | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
}

export function TaskDetailsDialog({
  taskId,
  onClose,
  onEdit,
}: TaskDetailsDialogProps) {
  const { data: task, isLoading } = useTaskDetails(taskId);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const addSubtaskMutation = useAddSubtask();
  const toggleSubtaskMutation = useToggleSubtask();
  const deleteSubtaskMutation = useDeleteSubtask();

  if (!taskId) return null;

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !taskId) return;
    await addSubtaskMutation.mutateAsync({
      taskId,
      title: newSubtaskTitle.trim(),
    });
    setNewSubtaskTitle("");
  };

  const handleToggleSubtask = async (subtaskId: string, currentCompleted: boolean) => {
    if (!taskId) return;
    await toggleSubtaskMutation.mutateAsync({
      taskId,
      subtaskId,
      completed: !currentCompleted,
    });
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!taskId) return;
    await deleteSubtaskMutation.mutateAsync({ taskId, subtaskId });
  };

  const completedCount = task?.subtasks.filter((s) => s.completed).length || 0;
  const totalSubtasks = task?.subtasks.length || 0;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedCount / totalSubtasks) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-xl shadow-xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between pb-3 border-b">
          <div>
            <CardTitle className="text-lg font-semibold leading-snug">
              {isLoading ? "Loading task..." : task?.title}
            </CardTitle>
            {task && (
              <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
                <span className="font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {task.category}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground uppercase font-semibold">
                  {task.priority} Priority
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  Status: {task.status.replace("_", " ")}
                </span>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 p-6 overflow-y-auto flex-1 text-sm">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading details...
            </div>
          ) : task ? (
            <>
              {/* Description */}
              {task.description ? (
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </h4>
                  <p className="text-foreground text-sm whitespace-pre-wrap leading-relaxed">
                    {task.description}
                  </p>
                </div>
              ) : (
                <p className="text-xs italic text-muted-foreground">
                  No description provided.
                </p>
              )}

              {/* Subtask Checklist Section */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">Subtasks</h4>
                  </div>
                  {totalSubtasks > 0 && (
                    <span className="text-xs text-muted-foreground font-medium">
                      {completedCount} / {totalSubtasks} completed ({progressPercent}%)
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {totalSubtasks > 0 && (
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}

                {/* Subtask List */}
                <div className="space-y-1.5 pt-1">
                  {task.subtasks.map((subtask) => (
                    <div
                      key={subtask._id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 text-xs border border-transparent hover:border-border transition-colors group"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(subtask._id, subtask.completed)}
                        className="flex items-center gap-2 text-left cursor-pointer flex-1"
                      >
                        {subtask.completed ? (
                          <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span
                          className={cn(
                            "font-medium",
                            subtask.completed && "line-through text-muted-foreground"
                          )}
                        >
                          {subtask.title}
                        </span>
                      </button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSubtask(subtask._id)}
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                        title="Delete Subtask"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add Subtask Form */}
                <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add a new subtask..."
                    className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newSubtaskTitle.trim() || addSubtaskMutation.isPending}
                    className="gap-1 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </form>
              </div>

              {/* Dates & Timestamps Metadata */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t text-xs text-muted-foreground">
                <div className="space-y-1">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" /> Due Date
                  </span>
                  <p>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}</p>
                </div>

                <div className="space-y-1">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Completed At
                  </span>
                  <p>{task.completedAt ? new Date(task.completedAt).toLocaleString() : "Not completed"}</p>
                </div>
              </div>
            </>
          ) : null}
        </CardContent>

        <CardFooter className="flex justify-between border-t p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (task) onEdit(task);
            }}
            className="gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit Task
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
