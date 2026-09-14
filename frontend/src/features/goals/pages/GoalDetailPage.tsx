import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Layers,
  CheckCircle2,
  Circle,
  Plus,
  Edit2,
  Trash2,
  Link2,
  Clock,
  Flag,
  Tag,
  AlertTriangle,
  Loader2,
  CheckSquare,
  Square,
  AlertCircle,
  Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoalProgress } from "../components/GoalProgress";
import { MilestoneDialog } from "../components/MilestoneDialog";
import { TaskAssociationDialog } from "../components/TaskAssociationDialog";
import { GoalDialog } from "../components/GoalDialog";
import {
  useGoal,
  useUpdateGoal,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  useAssociateTask,
} from "../hooks/useGoals";
import type { Milestone, MilestoneStatus, CreateMilestoneInput, CreateGoalInput } from "../types/goal";
import { updateTaskStatusApi } from "@/features/tasks/services/task.service";
import type { Task } from "@/features/tasks/types/task";
import { useQueryClient } from "@tanstack/react-query";

export function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false);
  const [isMilestoneOpen, setIsMilestoneOpen] = useState(false);
  const [milestoneToEdit, setMilestoneToEdit] = useState<Milestone | null>(null);
  const [isTaskAssocOpen, setIsTaskAssocOpen] = useState(false);

  const { data, isLoading, isError, error } = useGoal(id || "");

  const updateGoalMutation = useUpdateGoal();
  const createMilestoneMutation = useCreateMilestone();
  const updateMilestoneMutation = useUpdateMilestone();
  const deleteMilestoneMutation = useDeleteMilestone();
  const associateTaskMutation = useAssociateTask();

  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-xs text-muted-foreground">Loading goal details...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/goals")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Goals
        </Button>
        <Card className="border-destructive/40 bg-destructive/5 p-6 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <h3 className="text-base font-semibold text-destructive">Goal Not Found</h3>
          <p className="text-xs text-muted-foreground">
            {error?.message || "The requested goal could not be found or you do not have permission to view it."}
          </p>
        </Card>
      </div>
    );
  }

  const { goal, milestones, tasks, stats } = data;

  const isOverdue =
    goal.targetDate &&
    new Date(goal.targetDate) < new Date() &&
    goal.status !== "COMPLETED" &&
    goal.status !== "CANCELLED";

  const handleMilestoneSubmit = async (input: CreateMilestoneInput) => {
    if (!id) return;
    if (milestoneToEdit) {
      await updateMilestoneMutation.mutateAsync({
        goalId: id,
        milestoneId: milestoneToEdit._id,
        input,
      });
    } else {
      await createMilestoneMutation.mutateAsync({
        goalId: id,
        input,
      });
    }
  };

  const handleToggleMilestone = async (milestone: Milestone) => {
    if (!id) return;
    const newStatus: MilestoneStatus =
      milestone.status === "COMPLETED" ? "PENDING" : "COMPLETED";

    await updateMilestoneMutation.mutateAsync({
      goalId: id,
      milestoneId: milestone._id,
      input: { status: newStatus },
    });
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!id) return;
    await deleteMilestoneMutation.mutateAsync({
      goalId: id,
      milestoneId,
    });
  };

  const handleTaskToggleStatus = async (task: Task) => {
    const nextStatus = task.status === "COMPLETED" ? "TODO" : "COMPLETED";
    await updateTaskStatusApi(task._id, nextStatus);
    queryClient.invalidateQueries({ queryKey: ["goal", id] });
  };

  const handleUnlinkTask = async (taskId: string) => {
    await associateTaskMutation.mutateAsync({
      taskId,
      goalId: null,
      milestoneId: null,
    });
  };

  const handleUpdateGoalSubmit = async (input: CreateGoalInput) => {
    if (!id) return;
    await updateGoalMutation.mutateAsync({
      id,
      input,
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/goals")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Goals</span>
        </Button>

        <Button variant="outline" size="sm" onClick={() => setIsEditGoalOpen(true)} className="gap-1.5">
          <Edit2 className="h-3.5 w-3.5" />
          <span>Edit Goal</span>
        </Button>
      </div>

      {/* Main Goal Banner Card */}
      <Card className="border border-border/80 p-6 space-y-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {goal.status.replace("_", " ")}
              </Badge>

              <Badge variant="secondary" className="text-xs px-2.5 py-0.5 rounded-full font-normal flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {goal.category}
              </Badge>

              <span className="text-xs font-semibold flex items-center gap-1 text-primary">
                <Flag className="h-3 w-3" />
                {goal.priority} Priority
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {goal.title}
            </h1>

            {goal.description && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                {goal.description}
              </p>
            )}
          </div>

          {/* Dates & Timeline info */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 text-xs text-muted-foreground shrink-0 pt-2 border-t md:border-t-0 md:border-l md:pl-6 border-border">
            {goal.startDate && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Started: {new Date(goal.startDate).toLocaleDateString()}</span>
              </div>
            )}

            {goal.targetDate && (
              <div className={`flex items-center gap-1.5 font-medium ${isOverdue ? "text-rose-600 dark:text-rose-400" : ""}`}>
                {isOverdue ? (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                    <span>Overdue: {new Date(goal.targetDate).toLocaleDateString()}</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress & Milestone ratio overview */}
        <div className="pt-4 border-t border-border/60 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <GoalProgress progress={goal.progress} size="lg" />
          </div>

          <div className="flex items-center justify-around bg-muted/40 p-3 rounded-xl border border-border/50 text-xs">
            <div className="text-center">
              <div className="text-muted-foreground font-medium">Milestones</div>
              <div className="text-base font-bold font-mono text-primary">
                {stats.completedMilestones} / {stats.totalMilestones}
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-muted-foreground font-medium">Linked Tasks</div>
              <div className="text-base font-bold font-mono text-foreground">
                {stats.completedTasks} / {stats.totalTasks}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Milestones Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Milestones Roadmap
            </h2>
            <p className="text-xs text-muted-foreground">
              Sequential checkpoints required to achieve this goal ({stats.completedMilestones} of {stats.totalMilestones} completed).
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => {
              setMilestoneToEdit(null);
              setIsMilestoneOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Milestone</span>
          </Button>
        </div>

        {milestones.length === 0 ? (
          <Card className="p-8 text-center border-dashed space-y-2">
            <Layers className="h-8 w-8 text-muted-foreground/50 mx-auto" />
            <p className="text-xs text-muted-foreground">
              No milestones defined yet. Break down this goal into actionable steps!
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMilestoneToEdit(null);
                setIsMilestoneOpen(true);
              }}
            >
              Add First Milestone
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {milestones.map((milestone, idx) => {
              const isCompleted = milestone.status === "COMPLETED";

              return (
                <Card
                  key={milestone._id}
                  className={`p-4 transition-all border ${
                    isCompleted
                      ? "bg-muted/20 border-emerald-500/30"
                      : "bg-card border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleMilestone(milestone)}
                        className="mt-0.5 text-primary hover:scale-110 transition-transform"
                        title={isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                        )}
                      </button>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-muted-foreground">
                            #{idx + 1}
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              isCompleted
                                ? "line-through text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {milestone.title}
                          </span>

                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {milestone.status}
                          </Badge>
                        </div>

                        {milestone.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {milestone.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                          {milestone.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(milestone.dueDate).toLocaleDateString()}
                            </span>
                          )}

                          {milestone.completedAt && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              Completed on {new Date(milestone.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setMilestoneToEdit(milestone);
                          setIsMilestoneOpen(true);
                        }}
                        title="Edit Milestone"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteMilestone(milestone._id)}
                        title="Delete Milestone"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Related Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Related Tasks
            </h2>
            <p className="text-xs text-muted-foreground">
              Individual actionable tasks tied directly to this goal ({stats.completedTasks} of {stats.totalTasks} completed).
            </p>
          </div>

          <Button size="sm" variant="outline" onClick={() => setIsTaskAssocOpen(true)} className="gap-1.5">
            <Link2 className="h-4 w-4" />
            <span>Link Existing Task</span>
          </Button>
        </div>

        {tasks.length === 0 ? (
          <Card className="p-8 text-center border-dashed space-y-2">
            <Link2 className="h-8 w-8 text-muted-foreground/50 mx-auto" />
            <p className="text-xs text-muted-foreground">
              No tasks currently linked to this goal. Link tasks to track day-to-day execution!
            </p>
            <Button variant="outline" size="sm" onClick={() => setIsTaskAssocOpen(true)}>
              Link a Task
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => {
              const isTaskCompleted = task.status === "COMPLETED";

              return (
                <Card
                  key={task._id}
                  className="p-3 bg-card border border-border flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleTaskToggleStatus(task)}
                      className="text-primary hover:scale-110 transition-transform"
                    >
                      {isTaskCompleted ? (
                        <CheckSquare className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div
                        className={`font-semibold ${
                          isTaskCompleted ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span>{task.category}</span>
                        <span>•</span>
                        <span>Priority: {task.priority}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnlinkTask(task._id)}
                    className="h-8 px-2 text-[11px] text-muted-foreground hover:text-destructive"
                    title="Unlink from Goal"
                  >
                    <Unlink className="h-3.5 w-3.5 mr-1" />
                    Unlink
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog Modals */}
      <GoalDialog
        isOpen={isEditGoalOpen}
        onClose={() => setIsEditGoalOpen(false)}
        onSubmit={handleUpdateGoalSubmit}
        goalToEdit={goal}
        isLoading={updateGoalMutation.isPending}
      />

      <MilestoneDialog
        isOpen={isMilestoneOpen}
        onClose={() => {
          setIsMilestoneOpen(false);
          setMilestoneToEdit(null);
        }}
        onSubmit={handleMilestoneSubmit}
        milestoneToEdit={milestoneToEdit}
        isLoading={createMilestoneMutation.isPending || updateMilestoneMutation.isPending}
      />

      <TaskAssociationDialog
        isOpen={isTaskAssocOpen}
        onClose={() => setIsTaskAssocOpen(false)}
        goalId={id || ""}
        milestones={milestones}
        onAssociate={async (taskId, gId, mId) => {
          await associateTaskMutation.mutateAsync({
            taskId,
            goalId: gId,
            milestoneId: mId,
          });
        }}
        isLoading={associateTaskMutation.isPending}
      />
    </div>
  );
}
