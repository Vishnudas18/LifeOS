import { Search, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CalendarQueryFilters, EventType, EventStatus } from "../types/calendar";

interface CalendarFiltersProps {
  filters: CalendarQueryFilters;
  onChange: (filters: CalendarQueryFilters) => void;
  onReset: () => void;
}

const EVENT_TYPES: EventType[] = [
  "MEETING",
  "TASK",
  "DEADLINE",
  "PERSONAL",
  "REMINDER",
  "OTHER",
];

const EVENT_STATUSES: EventStatus[] = [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
];

export function CalendarFilters({
  filters,
  onChange,
  onReset,
}: CalendarFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-3.5 rounded-xl border border-border/70 shadow-sm">
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search calendar events by title, description, location..."
          value={filters.search || ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Select Filter Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium mr-1">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        {/* Type Select */}
        <select
          value={filters.type || "ALL"}
          onChange={(e) =>
            onChange({
              ...filters,
              type: e.target.value as EventType | "ALL",
            })
          }
          className="text-xs bg-background border border-input rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
        >
          <option value="ALL">All Event Types</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Status Select */}
        <select
          value={filters.status || "ALL"}
          onChange={(e) =>
            onChange({
              ...filters,
              status: e.target.value as EventStatus | "ALL",
            })
          }
          className="text-xs bg-background border border-input rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          {EVENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          title="Reset filters"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
}
