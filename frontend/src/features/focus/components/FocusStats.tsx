import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FocusSummary } from "../types/focus";
import { Clock, CheckCircle2, Award, Zap } from "lucide-react";

interface FocusStatsProps {
  summary: FocusSummary | undefined;
  isLoading: boolean;
}

export function formatDurationHuman(seconds: number): string {
  if (!seconds || seconds <= 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  if (h > 0 && m > 0) {
    return `${h}h ${m}m`;
  }
  if (h > 0) {
    return `${h}h`;
  }
  return `${m}m`;
}

export const FocusStats: React.FC<FocusStatsProps> = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 border border-border/50">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </Card>
        ))}
      </div>
    );
  }

  const todayTime = summary?.todayFocusTime || 0;
  const totalCompleted = summary?.completedSessions || 0;
  const avgDuration = summary?.averageSessionDuration || 0;
  const longestSession = summary?.longestSession || 0;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Today's Focus Time */}
      <Card className="p-4 border border-border/60 bg-card hover:border-indigo-500/30 transition-colors shadow-sm">
        <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today's Focus
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">
              {formatDurationHuman(todayTime)}
            </div>
            <p className="text-xs text-muted-foreground">Focus Time Today</p>
          </div>
        </CardContent>
      </Card>

      {/* Completed Sessions */}
      <Card className="p-4 border border-border/60 bg-card hover:border-emerald-500/30 transition-colors shadow-sm">
        <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sessions
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">
              {totalCompleted}
            </div>
            <p className="text-xs text-muted-foreground">Completed Sessions</p>
          </div>
        </CardContent>
      </Card>

      {/* Average Session Duration */}
      <Card className="p-4 border border-border/60 bg-card hover:border-amber-500/30 transition-colors shadow-sm">
        <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Average Session
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">
              {formatDurationHuman(avgDuration)}
            </div>
            <p className="text-xs text-muted-foreground">Avg Focus Duration</p>
          </div>
        </CardContent>
      </Card>

      {/* Longest Session */}
      <Card className="p-4 border border-border/60 bg-card hover:border-purple-500/30 transition-colors shadow-sm">
        <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Best Session
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">
              {formatDurationHuman(longestSession)}
            </div>
            <p className="text-xs text-muted-foreground">Longest Single Session</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
