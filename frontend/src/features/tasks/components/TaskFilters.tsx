import { Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TaskStatus, TaskPriority, TaskCategory, TaskQueryFilters } from "../types/task";

interface TaskFiltersProps {
  filters: TaskQueryFilters;
  onFilterChange: (newFilters: Partial<TaskQueryFilters>) => void;
  onClearFilters: () => void;
}

export function TaskFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: TaskFiltersProps) {
  const hasActiveFilters =
    !!filters.search ||
    !!filters.status ||
    !!filters.priority ||
    !!filters.category;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between bg-card p-3 rounded-lg border shadow-sm">
      {/* Search Input */}
      <div className="flex items-center flex-1 min-w-[200px] px-3 py-1.5 rounded-md border border-input bg-background text-sm text-foreground focus-within:ring-1 focus-within:ring-ring">
        <Search className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={filters.search || ""}
          onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
          placeholder="Search tasks by title, category, tags..."
          className="w-full bg-transparent outline-none placeholder:text-muted-foreground text-sm"
        />
        {filters.search && (
          <button
            onClick={() => onFilterChange({ search: "", page: 1 })}
            className="text-muted-foreground hover:text-foreground ml-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <select
          value={filters.status || ""}
          onChange={(e) =>
            onFilterChange({
              status: (e.target.value as TaskStatus) || undefined,
              page: 1,
            })
          }
          className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground outline-none cursor-pointer focus:ring-1 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="BACKLOG">Backlog</option>
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority || ""}
          onChange={(e) =>
            onFilterChange({
              priority: (e.target.value as TaskPriority) || undefined,
              page: 1,
            })
          }
          className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground outline-none cursor-pointer focus:ring-1 focus:ring-ring"
        >
          <option value="">All Priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Category Filter */}
        <select
          value={filters.category || ""}
          onChange={(e) =>
            onFilterChange({
              category: (e.target.value as TaskCategory) || undefined,
              page: 1,
            })
          }
          className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground outline-none cursor-pointer focus:ring-1 focus:ring-ring"
        >
          <option value="">All Categories</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Learning">Learning</option>
          <option value="Health">Health</option>
          <option value="Finance">Finance</option>
          <option value="Other">Other</option>
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <Filter className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
