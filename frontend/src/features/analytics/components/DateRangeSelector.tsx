import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Filter } from "lucide-react";

interface DateRangeSelectorProps {
  start: string;
  end: string;
  onChangeRange: (newStart: string, newEnd: string) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  start,
  end,
  onChangeRange,
}) => {
  const [preset, setPreset] = useState<string>("7D");
  const [customStart, setCustomStart] = useState<string>(
    start ? start.split("T")[0] : ""
  );
  const [customEnd, setCustomEnd] = useState<string>(
    end ? end.split("T")[0] : ""
  );
  const [showCustom, setShowCustom] = useState<boolean>(false);

  const applyPreset = (key: string) => {
    setPreset(key);
    setShowCustom(false);
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);

    if (key === "TODAY") {
      startDate.setHours(0, 0, 0, 0);
    } else if (key === "7D") {
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (key === "30D") {
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    } else if (key === "THIS_MONTH") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (key === "LAST_MONTH") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate.setDate(0); // Last day of previous month
      endDate.setHours(23, 59, 59, 999);
    }

    onChangeRange(startDate.toISOString(), endDate.toISOString());
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    const startDate = new Date(`${customStart}T00:00:00.000Z`);
    const endDate = new Date(`${customEnd}T23:59:59.999Z`);
    if (endDate >= startDate) {
      setPreset("CUSTOM");
      onChangeRange(startDate.toISOString(), endDate.toISOString());
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="flex items-center space-x-2 text-sm font-semibold text-foreground">
        <Calendar className="w-4 h-4 text-indigo-500" />
        <span>Date Range:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={preset === "7D" ? "default" : "outline"}
          className={`text-xs h-8 px-3 ${preset === "7D" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""}`}
          onClick={() => applyPreset("7D")}
        >
          Last 7 Days
        </Button>
        <Button
          type="button"
          size="sm"
          variant={preset === "30D" ? "default" : "outline"}
          className={`text-xs h-8 px-3 ${preset === "30D" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""}`}
          onClick={() => applyPreset("30D")}
        >
          Last 30 Days
        </Button>
        <Button
          type="button"
          size="sm"
          variant={preset === "THIS_MONTH" ? "default" : "outline"}
          className={`text-xs h-8 px-3 ${preset === "THIS_MONTH" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""}`}
          onClick={() => applyPreset("THIS_MONTH")}
        >
          This Month
        </Button>
        <Button
          type="button"
          size="sm"
          variant={preset === "LAST_MONTH" ? "default" : "outline"}
          className={`text-xs h-8 px-3 ${preset === "LAST_MONTH" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""}`}
          onClick={() => applyPreset("LAST_MONTH")}
        >
          Last Month
        </Button>
        <Button
          type="button"
          size="sm"
          variant={preset === "CUSTOM" || showCustom ? "secondary" : "outline"}
          className="text-xs h-8 px-3"
          onClick={() => setShowCustom(!showCustom)}
        >
          <Filter className="w-3.5 h-3.5 mr-1" />
          Custom...
        </Button>
      </div>

      {showCustom && (
        <form onSubmit={handleApplyCustom} className="flex items-center space-x-2 pt-2 sm:pt-0 w-full sm:w-auto">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="px-2 py-1 text-xs border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-2 py-1 text-xs border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button type="submit" size="sm" className="text-xs h-7 px-3 bg-indigo-600 text-white">
            Apply
          </Button>
        </form>
      )}
    </div>
  );
};
