import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { GoalAnalytics } from "../types/analytics";
import { Target, Flag } from "lucide-react";

interface GoalChartsProps {
  goals: GoalAnalytics | undefined;
  isLoading: boolean;
}

export const GoalCharts: React.FC<GoalChartsProps> = ({ goals, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-border/60"><Skeleton className="h-48 w-full" /></Card>
        <Card className="p-6 border border-border/60"><Skeleton className="h-48 w-full" /></Card>
      </div>
    );
  }

  const data = goals || {
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    goalsByCategory: [],
    goalsByStatus: [],
    averageProgress: 0,
    milestoneStats: { total: 0, completed: 0, completionRate: 0 },
  };

  const categories = data.goalsByCategory || [];
  const milestones = data.milestoneStats;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Goal Overview Progress */}
      <Card className="border border-border/60 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-indigo-500" />
            <CardTitle className="text-base font-bold">Goal Progress & Status</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {data.activeGoals} Active Goals
          </Badge>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Average Goal Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Average Goal Progress</span>
              <span className="text-foreground">{data.averageProgress}%</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, data.averageProgress))}%` }}
              />
            </div>
          </div>

          {/* Goal Categories Distribution */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Goals by Category
            </h4>
            {categories.length === 0 ? (
              <p className="text-xs text-muted-foreground">No active goals yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Badge key={cat.category} variant="outline" className="px-3 py-1 text-xs">
                    <span className="font-semibold mr-1">{cat.category}:</span> {cat.count}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Milestone Completion Rate */}
      <Card className="border border-border/60 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center space-x-2">
            <Flag className="w-5 h-5 text-emerald-500" />
            <CardTitle className="text-base font-bold">Milestones Momentum</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs font-semibold text-emerald-500 border-emerald-500/30">
            {milestones.completionRate}% Rate
          </Badge>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
              <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">Total Milestones</div>
              <div className="text-2xl font-black text-foreground">{milestones.total}</div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
              <div className="text-xs font-semibold uppercase mb-1">Completed</div>
              <div className="text-2xl font-black">{milestones.completed}</div>
            </div>
          </div>

          {/* Milestone Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Completion Progress</span>
              <span className="text-emerald-600">{milestones.completionRate}%</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, milestones.completionRate))}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
