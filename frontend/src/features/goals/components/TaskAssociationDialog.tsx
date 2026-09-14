import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Search, Link2, Check, Loader2, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Milestone } from "../types/goal";
import { getTasksApi } from "@/features/tasks/services/task.service";
import type { Task } from "@/features/tasks/types/task";

interface TaskAssociationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goalId: string;
  milestones: Milestone[];
  onAssociate: (taskId: string, goalId: string, milestoneId?: string | null) => Promise<void>;
  isLoading?: boolean;
}

export function TaskAssociationDialog({
  isOpen,
  onClose,
  goalId,
  milestones,
  onAssociate,
  isLoading,
}: TaskAssociationDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("");

  // Fetch tasks
  const { data: tasksData, isLoading: isFetchingTasks } = useQuery({
    queryKey: ["tasks", { limit: 50, search }],
    queryFn: async () => {
      const res = await getTasksApi({ limit: 50, search });
      if (!res.success || !res.data) return [];
      return res.data.tasks;
    },
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selectedTaskId) return;
    await onAssociate(
      selectedTaskId,
      goalId,
      selectedMilestoneId ? selectedMilestoneId : null
    );
    setSelectedTaskId(null);
    setSelectedMilestoneId("");
    onClose();
  };

  const tasksList = tasksData || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-md shadow-2xl flex flex-col max-h-[85vh]">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              Link Task to Goal
            </CardTitle>
            <CardDescription className="text-xs">
              Select a task to associate with this goal or a specific milestone.
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Milestone Selection (Optional) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Milestone (Optional)
            </label>
            <select
              value={selectedMilestoneId}
              onChange={(e) => setSelectedMilestoneId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">-- No specific milestone (Goal direct) --</option>
              {milestones.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title} ({m.status})
                </option>
              ))}
            </select>
          </div>

          {/* Search Task */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search existing tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Task Selection List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {isFetchingTasks ? (
              <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Loading your tasks...</span>
              </div>
            ) : tasksList.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                <ListTodo className="h-6 w-6 mx-auto text-muted-foreground/50" />
                <p>No tasks found.</p>
              </div>
            ) : (
              tasksList.map((task: Task) => {
                const isSelected = selectedTaskId === task._id;
                const isAlreadyLinked = task.goalId === goalId;

                return (
                  <div
                    key={task._id}
                    onClick={() => setSelectedTaskId(task._id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : isAlreadyLinked
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {task.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span>Status: {task.status}</span>
                        <span>•</span>
                        <span>{task.category}</span>
                      </div>
                    </div>

                    {isSelected ? (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    ) : isAlreadyLinked ? (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                        Linked
                      </span>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-end gap-2 p-4 border-t bg-muted/20">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!selectedTaskId || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Link Task
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
