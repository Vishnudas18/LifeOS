import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { CalendarAnalytics } from "../types/analytics";
import { Calendar, CheckCircle2, XCircle } from "lucide-react";

interface CalendarChartsProps {
  calendar: CalendarAnalytics | undefined;
  isLoading: boolean;
}

export const CalendarCharts: React.FC<CalendarChartsProps> = ({ calendar, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="p-6 border border-border/60"><Skeleton className="h-48 w-full" /></Card>
    );
  }

  const data = calendar || {
    totalEvents: 0,
    completedEvents: 0,
    cancelledEvents: 0,
    eventsByType: [],
    dailyTrend: [],
  };

  const types = data.eventsByType || [];

  return (
    <Card className="border border-border/60 bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          <CardTitle className="text-base font-bold">Calendar Activity</CardTitle>
        </div>
        <Badge variant="outline" className="text-xs font-semibold">
          {data.totalEvents} Scheduled Events
        </Badge>
      </CardHeader>

      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-1">
          <div className="p-4 rounded-xl bg-muted/40 border border-border/40 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Events</span>
            <div className="text-2xl font-black text-foreground">{data.totalEvents}</div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
            <span className="text-xs font-semibold flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1.5 inline" /> Completed
            </span>
            <span className="text-base font-bold">{data.completedEvents}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600">
            <span className="text-xs font-semibold flex items-center">
              <XCircle className="w-4 h-4 mr-1.5 inline" /> Cancelled
            </span>
            <span className="text-base font-bold">{data.cancelledEvents}</span>
          </div>
        </div>

        {/* Events by Type Breakdown */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Events by Type
          </h4>
          {types.length === 0 ? (
            <p className="text-xs text-muted-foreground">No events scheduled in this period.</p>
          ) : (
            <div className="space-y-2">
              {types.map((item) => {
                const pct = data.totalEvents > 0 ? Math.round((item.count / data.totalEvents) * 100) : 0;
                return (
                  <div key={item.type} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-foreground">{item.type}</span>
                      <span className="text-muted-foreground">{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
