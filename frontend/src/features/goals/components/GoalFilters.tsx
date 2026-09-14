import { Search, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GoalQueryFilters, GoalStatus, GoalCategory, GoalPriority } from "../types/goal";

interface GoalFiltersProps {
  filters: GoalQueryFilters;
  onChange: (filters: GoalQueryFilters) => void;
  onReset: () => void;
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

export function GoalFilters({ filters, onChange, onReset }: GoalFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-4 rounded-xl border border-border/70 shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search goals by title or description..."
          value={filters.search || ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
          className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Select Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium mr-1">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        {/* Category */}
        <select
          value={filters.category || "ALL"}
          onChange={(e) =>
            onChange({
              ...filters,
              category: e.target.value as GoalCategory | "ALL",
              page: 1,
            })
          }
          className="text-xs bg-background border border-input rounded-lg px-2.5 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
        >
          <option value="ALL">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.status || "ALL"}
          onChange={(e) =>
            onChange({
              ...filters,
              status: e.target.value as GoalStatus | "ALL",
              page: 1,
            })
          }
          className="text-xs bg-background border border-input rounded-lg px-2.5 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          {STATUSES.map((st) => (
            <option key={st} value={st}>
              {st.replace("_", " ")}
            </option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={filters.priority || "ALL"}
          onChange={(e) =>
            onChange({
              ...filters,
              priority: e.target.value as GoalPriority | "ALL",
              page: 1,
            })
          }
          className="text-xs bg-background border border-input rounded-lg px-2.5 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
        >
          <option value="ALL">All Priorities</option>
          {PRIORITIES.map((pri) => (
            <option key={pri} value={pri}>
              {pri} Priority
            </option>
          ))}
        </select>

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          title="Reset Filters"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
}
