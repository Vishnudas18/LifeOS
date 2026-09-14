import { useState } from "react";
import {
  Plus,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ListTodo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task, TaskQueryFilters, CreateTaskInput } from "@/features/tasks/types/task";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useUpdateTaskStatus,
  useDeleteTask,
} from "@/features/tasks/hooks/useTasks";
import { TaskFilters } from "@/features/tasks/components/TaskFilters";
import { TaskCard } from "@/features/tasks/components/TaskCard";
import { TaskDialog } from "@/features/tasks/components/TaskDialog";
import { TaskDetailsDialog } from "@/features/tasks/components/TaskDetailsDialog";
import { DeleteTaskDialog } from "@/features/tasks/components/DeleteTaskDialog";

export default function Tasks() {
  const [filters, setFilters] = useState<TaskQueryFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // TanStack Query Hooks
  const { data, isLoading, isError, refetch } = useTasks(filters);
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const updateStatusMutation = useUpdateTaskStatus();
  const deleteTaskMutation = useDeleteTask();

  const handleFilterChange = (newFilters: Partial<TaskQueryFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const handleCreateOrUpdateTask = async (input: CreateTaskInput) => {
    if (taskToEdit) {
      await updateTaskMutation.mutateAsync({ taskId: taskToEdit._id, input });
    } else {
      await createTaskMutation.mutateAsync(input);
    }
  };

  const handleStatusToggle = async (task: Task) => {
    const newStatus = task.status === "COMPLETED" ? "TODO" : "COMPLETED";
    await updateStatusMutation.mutateAsync({ taskId: task._id, status: newStatus });
  };

  const tasks = data?.tasks || [];
  const pagination = data?.pagination;

  // Compute summary stats from current tasks query or total count
  const totalCount = pagination?.total || 0;
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todoCount = tasks.filter((t) => t.status === "TODO").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Task Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Organize, prioritize, and accomplish your daily action items.
          </p>
        </div>

        <Button
          onClick={() => {
            setTaskToEdit(null);
            setIsTaskDialogOpen(true);
          }}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Tasks
            </CardTitle>
            <ListTodo className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Active & archived tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              To Do
            </CardTitle>
            <Clock className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todoCount}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Tasks waiting to start
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              In Progress
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Currently active work
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Finished action items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <TaskFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Task List / Content View */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 rounded-lg border bg-card/50 p-4 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive/30 bg-destructive/5 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Unable to load tasks
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            An error occurred while connecting to the tasks service.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try Again
          </Button>
        </Card>
      ) : tasks.length === 0 ? (
        <Card className="min-h-[250px] flex items-center justify-center border-dashed p-8 text-center">
          <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
              <CheckSquare className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              No tasks found
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
              {filters.search || filters.status || filters.priority
                ? "No tasks match your current filter criteria."
                : "Create your first task to start organizing your day."}
            </p>
            {filters.search || filters.status || filters.priority ? (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskDialogOpen(true);
                }}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" /> Create First Task
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusToggle={handleStatusToggle}
              onSelect={(t) => setSelectedTaskId(t._id)}
              onEdit={(t) => {
                setTaskToEdit(t);
                setIsTaskDialogOpen(true);
              }}
              onDelete={(t) => setTaskToDelete(t)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <p>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
            total tasks)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() =>
                handleFilterChange({ page: Math.max(1, pagination.page - 1) })
              }
              className="h-8 gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handleFilterChange({ page: pagination.page + 1 })}
              className="h-8 gap-1"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        onSubmit={handleCreateOrUpdateTask}
        taskToEdit={taskToEdit}
        isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onEdit={(t) => {
          setSelectedTaskId(null);
          setTaskToEdit(t);
          setIsTaskDialogOpen(true);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteTaskDialog
        task={taskToDelete}
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={async (taskId) => {
          await deleteTaskMutation.mutateAsync(taskId);
        }}
        isLoading={deleteTaskMutation.isPending}
      />
    </div>
  );
}
