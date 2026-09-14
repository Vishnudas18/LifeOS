import { useState } from "react";
import { Plus, Target, CheckCircle2, Clock, PauseCircle, Layers, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GoalCard } from "../components/GoalCard";
import { GoalFilters } from "../components/GoalFilters";
import { GoalDialog } from "../components/GoalDialog";
import { DeleteGoalConfirmModal } from "../components/DeleteGoalConfirmModal";
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from "../hooks/useGoals";
import type { Goal, GoalQueryFilters, CreateGoalInput, UpdateGoalInput } from "../types/goal";

export function GoalsPage() {
  const [filters, setFilters] = useState<GoalQueryFilters>({
    page: 1,
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  const { data, isLoading, isError, error, refetch } = useGoals(filters);
  const createGoalMutation = useCreateGoal();
  const updateGoalMutation = useUpdateGoal();
  const deleteGoalMutation = useDeleteGoal();

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const handleCreateSubmit = async (input: CreateGoalInput) => {
    if (goalToEdit) {
      await updateGoalMutation.mutateAsync({ id: goalToEdit._id, input: input as UpdateGoalInput });
    } else {
      await createGoalMutation.mutateAsync(input);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!goalToDelete) return;
    await deleteGoalMutation.mutateAsync(goalToDelete._id);
    setGoalToDelete(null);
  };

  const summary = data?.summary || { total: 0, active: 0, completed: 0, onHold: 0 };
  const goals = data?.goals || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Goals & Roadmap
          </h1>
          <p className="text-sm text-muted-foreground">
            Define high-level objectives, break them into milestones, and track execution.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="sm:self-start gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>New Goal</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border/80 p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Total Goals</div>
            <div className="text-xl font-bold font-mono">{summary.total}</div>
          </div>
        </Card>

        <Card className="bg-card border-border/80 p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">In Progress</div>
            <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {summary.active}
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border/80 p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Completed</div>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {summary.completed}
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border/80 p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <PauseCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">On Hold</div>
            <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {summary.onHold}
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <GoalFilters filters={filters} onChange={setFilters} onReset={handleResetFilters} />

      {/* Error state */}
      {isError && (
        <Card className="border-destructive/40 bg-destructive/5 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1 text-xs text-destructive">
            {error?.message || "An error occurred while loading goals."}
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      )}

      {/* Goal Cards Grid or Skeletons / Empty */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-56 animate-pulse bg-muted/40 p-5 space-y-4">
              <div className="h-4 bg-muted/70 rounded w-1/3" />
              <div className="h-6 bg-muted/70 rounded w-3/4" />
              <div className="h-3 bg-muted/60 rounded w-full" />
              <div className="h-2 bg-muted/70 rounded w-full pt-4" />
            </Card>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card className="min-h-[350px] flex items-center justify-center border-dashed border-border/80">
          <CardContent className="text-center p-8 space-y-3 max-w-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-7 w-7" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No goals found</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No goals match your criteria. Create your first goal and start breaking it down into actionable milestones!
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2 mt-2">
              <Plus className="h-4 w-4" />
              <span>Create your first Goal</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onEdit={(g) => {
                setGoalToEdit(g);
                setIsCreateOpen(true);
              }}
              onDelete={(g) => setGoalToDelete(g)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground font-medium">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} goals)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <GoalDialog
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setGoalToEdit(null);
        }}
        onSubmit={handleCreateSubmit}
        goalToEdit={goalToEdit}
        isLoading={createGoalMutation.isPending || updateGoalMutation.isPending}
      />

      <DeleteGoalConfirmModal
        isOpen={!!goalToDelete}
        onClose={() => setGoalToDelete(null)}
        onConfirm={handleDeleteConfirm}
        goal={goalToDelete}
        isLoading={deleteGoalMutation.isPending}
      />
    </div>
  );
}
