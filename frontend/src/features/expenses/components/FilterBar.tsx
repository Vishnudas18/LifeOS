import { Search, Filter, Calendar as CalendarIcon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  formatCategoryName,
  formatPaymentMethodName,
  type TransactionType,
  type PaymentMethod,
} from "../types/transaction";

export type DateRangePreset = "ALL" | "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "LAST_MONTH" | "CUSTOM";

interface FilterBarProps {
  typeFilter: TransactionType | "ALL";
  onTypeChange: (type: TransactionType | "ALL") => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  paymentMethodFilter: string;
  onPaymentMethodChange: (method: string) => void;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  datePreset: DateRangePreset;
  onDatePresetChange: (preset: DateRangePreset) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  onResetFilters: () => void;
}

export function FilterBar({
  typeFilter,
  onTypeChange,
  categoryFilter,
  onCategoryChange,
  paymentMethodFilter,
  onPaymentMethodChange,
  searchQuery,
  onSearchChange,
  datePreset,
  onDatePresetChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onResetFilters,
}: FilterBarProps) {
  const availableCategories =
    typeFilter === "INCOME"
      ? INCOME_CATEGORIES
      : typeFilter === "EXPENSE"
      ? EXPENSE_CATEGORIES
      : [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  const hasActiveFilters =
    typeFilter !== "ALL" ||
    categoryFilter !== "" ||
    paymentMethodFilter !== "" ||
    searchQuery !== "" ||
    datePreset !== "ALL";

  return (
    <div className="space-y-3 bg-card p-4 rounded-xl border shadow-sm">
      {/* Top Row: Type Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Type Toggle Tabs */}
        <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground select-none">
          <button
            type="button"
            onClick={() => onTypeChange("ALL")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              typeFilter === "ALL"
                ? "bg-background text-foreground shadow-sm"
                : "hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onTypeChange("EXPENSE")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              typeFilter === "EXPENSE"
                ? "bg-background text-rose-600 dark:text-rose-400 shadow-sm"
                : "hover:text-foreground"
            }`}
          >
            Expenses
          </button>
          <button
            type="button"
            onClick={() => onTypeChange("INCOME")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              typeFilter === "INCOME"
                ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "hover:text-foreground"
            }`}
          >
            Income
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search description or notes..."
            className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Bottom Row: Category, Payment Method, Date Preset & Reset */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-xs">
        <div className="flex items-center gap-1 text-muted-foreground font-medium mr-1">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium outline-none focus:ring-1 focus:ring-ring cursor-pointer"
        >
          <option value="">All Categories</option>
          {availableCategories.map((cat) => (
            <option key={cat} value={cat}>
              {formatCategoryName(cat)}
            </option>
          ))}
        </select>

        {/* Payment Method Dropdown */}
        <select
          value={paymentMethodFilter}
          onChange={(e) => onPaymentMethodChange(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium outline-none focus:ring-1 focus:ring-ring cursor-pointer"
        >
          <option value="">All Payment Methods</option>
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {formatPaymentMethodName(method as PaymentMethod)}
            </option>
          ))}
        </select>

        {/* Date Presets Dropdown */}
        <select
          value={datePreset}
          onChange={(e) => onDatePresetChange(e.target.value as DateRangePreset)}
          className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium outline-none focus:ring-1 focus:ring-ring cursor-pointer"
        >
          <option value="ALL">All Time</option>
          <option value="TODAY">Today</option>
          <option value="THIS_WEEK">This Week</option>
          <option value="THIS_MONTH">This Month</option>
          <option value="LAST_MONTH">Last Month</option>
          <option value="CUSTOM">Custom Range</option>
        </select>

        {/* Custom Date Inputs if CUSTOM is selected */}
        {datePreset === "CUSTOM" && (
          <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        )}

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 ml-auto"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
