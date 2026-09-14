import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock } from "lucide-react";

interface ProductivityChartsProps {
  dailyTrend: { date: string; tasksCompleted: number; tasksCreated: number; focusSeconds: number }[] | undefined;
  isLoading: boolean;
}

export const ProductivityCharts: React.FC<ProductivityChartsProps> = ({
  dailyTrend,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-border/60"><Skeleton className="h-64 w-full" /></Card>
        <Card className="p-6 border border-border/60"><Skeleton className="h-64 w-full" /></Card>
      </div>
    );
  }

  const data = dailyTrend || [];
  if (data.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground border border-border/60">
        No daily trend data available for this range.
      </Card>
    );
  }

  // Calculate SVG dimensions
  const width = 500;
  const height = 200;
  const padding = 30;

  // Max values for scaling
  const maxTasks = Math.max(1, ...data.map((d) => Math.max(d.tasksCompleted, d.tasksCreated)));
  const maxFocusMins = Math.max(1, ...data.map((d) => Math.round(d.focusSeconds / 60)));

  // Map task points
  const taskPoints = data.map((d, i) => {
    const x = padding + (i / Math.max(1, data.length - 1)) * (width - padding * 2);
    const yCompleted = height - padding - (d.tasksCompleted / maxTasks) * (height - padding * 2);
    const yCreated = height - padding - (d.tasksCreated / maxTasks) * (height - padding * 2);
    return { x, yCompleted, yCreated, date: d.date, completed: d.tasksCompleted, created: d.tasksCreated };
  });

  // Map focus points
  const focusPoints = data.map((d, i) => {
    const x = padding + (i / Math.max(1, data.length - 1)) * (width - padding * 2);
    const mins = Math.round(d.focusSeconds / 60);
    const y = height - padding - (mins / maxFocusMins) * (height - padding * 2);
    return { x, y, date: d.date, mins };
  });

  const completedPathStr = taskPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yCompleted}`).join(" ");
  const createdPathStr = taskPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yCreated}`).join(" ");

  const focusPathStr = focusPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const focusAreaStr = `${focusPathStr} L ${focusPoints[focusPoints.length - 1].x} ${height - padding} L ${focusPoints[0].x} ${height - padding} Z`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Task Output Trend (Line Chart) */}
      <Card className="border border-border/60 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
            <CardTitle className="text-base font-bold">Tasks Created vs Completed</CardTitle>
          </div>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" />Completed</span>
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-1.5" />Created</span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative w-full h-[220px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              {/* Horizontal Grid lines */}
              {[0, 0.5, 1].map((r) => {
                const y = height - padding - r * (height - padding * 2);
                return (
                  <line key={r} x1={padding} y1={y} x2={width - padding} y2={y} className="stroke-muted/40" strokeDasharray="3 3" />
                );
              })}
              {/* Lines */}
              <path d={createdPathStr} fill="none" className="stroke-indigo-500" strokeWidth="2.5" />
              <path d={completedPathStr} fill="none" className="stroke-emerald-500" strokeWidth="2.5" />

              {/* Data points */}
              {taskPoints.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.yCompleted} r="4" className="fill-emerald-500 stroke-background" strokeWidth="2" />
                  <circle cx={p.x} cy={p.yCreated} r="4" className="fill-indigo-500 stroke-background" strokeWidth="2" />
                </g>
              ))}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Focus Minutes Trend (Area Chart) */}
      <Card className="border border-border/60 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <CardTitle className="text-base font-bold">Daily Focus Minutes</CardTitle>
          </div>
          <span className="text-xs font-semibold text-purple-500">Focus Minutes</span>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative w-full h-[220px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {[0, 0.5, 1].map((r) => {
                const y = height - padding - r * (height - padding * 2);
                return (
                  <line key={r} x1={padding} y1={y} x2={width - padding} y2={y} className="stroke-muted/40" strokeDasharray="3 3" />
                );
              })}
              <path d={focusAreaStr} fill="url(#focusGrad)" />
              <path d={focusPathStr} fill="none" className="stroke-purple-500" strokeWidth="2.5" />
              {focusPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" className="fill-purple-500 stroke-background" strokeWidth="2" />
              ))}
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
