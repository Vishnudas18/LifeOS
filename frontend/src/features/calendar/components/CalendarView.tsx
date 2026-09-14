import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CalendarEvent } from "../types/calendar";

type ViewMode = "month" | "week" | "day" | "list";

interface CalendarViewProps {
  events: CalendarEvent[];
  onRangeChange: (startIso: string, endIso: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  onDateSelect: (startIso: string, endIso: string) => void;
  onEventDrop: (
    eventId: string,
    newStartIso: string,
    newEndIso: string,
    revert: () => void
  ) => Promise<void>;
  onEventResize: (
    eventId: string,
    newStartIso: string,
    newEndIso: string,
    revert: () => void
  ) => Promise<void>;
}

export function CalendarView({
  events,
  onRangeChange,
  onEventClick,
  onDateSelect,
  onEventDrop,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);

  // Calculate start and end of visible range based on viewMode and currentDate
  const visibleRange = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (viewMode === "month") {
      // First day of calendar grid (start of week containing 1st of month)
      const firstOfMonth = new Date(year, month, 1);
      const startDayOfWeek = firstOfMonth.getDay();
      const startDate = new Date(year, month, 1 - startDayOfWeek, 0, 0, 0, 0);

      // Last day of calendar grid (end of week containing last day of month)
      const lastOfMonth = new Date(year, month + 1, 0);
      const endDayOfWeek = lastOfMonth.getDay();
      const endDate = new Date(year, month + 1, 6 - endDayOfWeek, 23, 59, 59, 999);

      return { start: startDate, end: endDate };
    } else if (viewMode === "week") {
      const dayOfWeek = currentDate.getDay();
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      return { start: startDate, end: endDate };
    } else if (viewMode === "day") {
      const startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(currentDate);
      endDate.setHours(23, 59, 59, 999);

      return { start: startDate, end: endDate };
    } else {
      // Agenda List view: 30 days window around current date
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(currentDate);
      endDate.setDate(currentDate.getDate() + 30);
      endDate.setHours(23, 59, 59, 999);

      return { start: startDate, end: endDate };
    }
  }, [currentDate, viewMode]);

  // Notify parent of range change
  useEffect(() => {
    onRangeChange(
      visibleRange.start.toISOString(),
      visibleRange.end.toISOString()
    );
  }, [visibleRange, onRangeChange]);

  // Navigation handlers
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else if (viewMode === "week") {
      newDate.setDate(currentDate.getDate() - 7);
    } else if (viewMode === "day") {
      newDate.setDate(currentDate.getDate() - 1);
    } else {
      newDate.setDate(currentDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else if (viewMode === "week") {
      newDate.setDate(currentDate.getDate() + 7);
    } else if (viewMode === "day") {
      newDate.setDate(currentDate.getDate() + 1);
    } else {
      newDate.setDate(currentDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Header Title
  const headerTitle = useMemo(() => {
    const monthName = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();
    if (viewMode === "month") return `${monthName} ${year}`;
    if (viewMode === "week") {
      return `Week of ${visibleRange.start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${visibleRange.end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
    }
    if (viewMode === "day") {
      return currentDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    }
    return `Agenda (${monthName} ${year})`;
  }, [currentDate, viewMode, visibleRange]);

  // Filter events belonging to visible range
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const evtStart = new Date(evt.startDateTime);
      const evtEnd = new Date(evt.endDateTime);
      return evtStart <= visibleRange.end && evtEnd >= visibleRange.start;
    });
  }, [events, visibleRange]);

  // Build grid days for Month View
  const monthDays = useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];
    const curr = new Date(visibleRange.start);
    const todayStr = new Date().toDateString();

    while (curr <= visibleRange.end) {
      days.push({
        date: new Date(curr),
        isCurrentMonth: curr.getMonth() === currentDate.getMonth(),
        isToday: curr.toDateString() === todayStr,
      });
      curr.setDate(curr.getDate() + 1);
    }
    return days;
  }, [visibleRange, currentDate]);

  // Drag and Drop handlers
  const handleDragStart = (evt: CalendarEvent) => {
    setDraggedEvent(evt);
  };

  const handleDropOnDay = async (targetDate: Date) => {
    if (!draggedEvent) return;

    const origStart = new Date(draggedEvent.startDateTime);
    const origEnd = new Date(draggedEvent.endDateTime);
    const durationMs = origEnd.getTime() - origStart.getTime();

    // Preserve hours/minutes on target date
    const newStart = new Date(targetDate);
    newStart.setHours(origStart.getHours(), origStart.getMinutes(), 0, 0);

    const newEnd = new Date(newStart.getTime() + durationMs);

    setDraggedEvent(null);
    await onEventDrop(
      draggedEvent._id,
      newStart.toISOString(),
      newEnd.toISOString(),
      () => {}
    );
  };

  return (
    <div className="bg-card border border-border/80 rounded-xl shadow-sm flex flex-col overflow-hidden">
      {/* Header Toolbar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/20">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday} className="h-8 text-xs font-semibold">
            Today
          </Button>

          <div className="flex items-center border border-input rounded-lg bg-background">
            <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8 rounded-r-none">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8 rounded-l-none">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-foreground ml-2">
            {headerTitle}
          </h2>
        </div>

        {/* View Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg self-start sm:self-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setViewMode("month")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              viewMode === "month"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setViewMode("week")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              viewMode === "week"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setViewMode("day")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              viewMode === "day"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Day
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              viewMode === "list"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Agenda
          </button>
        </div>
      </div>

      {/* View Body */}
      {viewMode === "month" && (
        <div className="flex-1 flex flex-col">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-border text-center text-xs font-semibold text-muted-foreground bg-muted/40 py-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr flex-1 border-b border-border">
            {monthDays.map((dayItem, idx) => {
              const dayEvents = filteredEvents.filter((e) => {
                const eDate = new Date(e.startDateTime);
                return eDate.toDateString() === dayItem.date.toDateString();
              });

              return (
                <div
                  key={idx}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnDay(dayItem.date)}
                  onClick={() => {
                    const start = new Date(dayItem.date);
                    start.setHours(9, 0, 0, 0);
                    const end = new Date(dayItem.date);
                    end.setHours(10, 0, 0, 0);
                    onDateSelect(start.toISOString(), end.toISOString());
                  }}
                  className={`min-h-[110px] p-1.5 border-r border-b border-border/60 transition-colors cursor-pointer flex flex-col justify-between ${
                    dayItem.isCurrentMonth
                      ? "bg-card hover:bg-muted/30"
                      : "bg-muted/15 text-muted-foreground/60"
                  } ${dayItem.isToday ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold h-6 w-6 rounded-full flex items-center justify-center ${
                        dayItem.isToday
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : dayItem.isCurrentMonth
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {dayItem.date.getDate()}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-muted-foreground font-mono font-medium">
                        {dayEvents.length} event{dayEvents.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Events List inside Day Cell */}
                  <div className="space-y-1 my-1 flex-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((evt) => (
                      <div
                        key={evt._id}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleDragStart(evt);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(evt);
                        }}
                        style={{
                          backgroundColor:
                            evt.color ||
                            (evt.status === "COMPLETED" ? "#10b981" : "#3b82f6"),
                        }}
                        className="text-[11px] font-medium text-white px-2 py-0.5 rounded shadow-xs truncate cursor-grab active:cursor-grabbing hover:opacity-90 transition-opacity flex items-center justify-between gap-1"
                      >
                        <span className="truncate">{evt.title}</span>
                        <span className="text-[9px] opacity-85 shrink-0 font-mono">
                          {new Date(evt.startDateTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}

                    {dayEvents.length > 3 && (
                      <div className="text-[10px] font-semibold text-primary pl-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week / Day View Grid */}
      {(viewMode === "week" || viewMode === "day") && (
        <div className="p-4 space-y-4 overflow-y-auto max-h-[650px]">
          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                <CalendarIcon className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <p>No events scheduled for this period.</p>
              </div>
            ) : (
              filteredEvents.map((evt) => (
                <div
                  key={evt._id}
                  onClick={() => onEventClick(evt)}
                  className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-1.5 h-12 rounded-full shrink-0 mt-0.5"
                      style={{
                        backgroundColor:
                          evt.color ||
                          (evt.status === "COMPLETED" ? "#10b981" : "#3b82f6"),
                      }}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] px-2 py-0">
                          {evt.status}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] px-2 py-0">
                          {evt.type}
                        </Badge>
                      </div>

                      <h4 className="text-sm font-bold text-foreground">
                        {evt.title}
                      </h4>

                      {evt.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {evt.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0 border-t md:border-t-0 pt-2 md:pt-0">
                    <div className="flex items-center gap-1 font-medium">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>
                        {new Date(evt.startDateTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(evt.endDateTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {evt.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{evt.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Agenda / List View */}
      {viewMode === "list" && (
        <div className="p-4 space-y-3 max-h-[650px] overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
              <List className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <p>No upcoming events in agenda.</p>
            </div>
          ) : (
            filteredEvents.map((evt) => (
              <div
                key={evt._id}
                onClick={() => onEventClick(evt)}
                className="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        evt.color ||
                        (evt.status === "COMPLETED" ? "#10b981" : "#3b82f6"),
                    }}
                  />

                  <div className="space-y-0.5 min-w-0">
                    <div className="font-semibold text-foreground truncate">
                      {evt.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                      <span>{evt.type}</span>
                      <span>•</span>
                      <span>{evt.status}</span>
                      {evt.location && (
                        <>
                          <span>•</span>
                          <span className="truncate">{evt.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 text-muted-foreground font-medium font-mono text-[11px]">
                  <div>{new Date(evt.startDateTime).toLocaleDateString()}</div>
                  <div>
                    {new Date(evt.startDateTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
