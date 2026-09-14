import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { MetricComparison } from "../types/analytics";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  metric?: MetricComparison;
  formatter?: (val: number) => string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  invertColorLogic?: boolean; // e.g. Expenses UP = bad (warning red/amber)
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  metric,
  formatter = (v) => v.toString(),
  icon,
  isLoading = false,
  invertColorLogic = false,
}) => {
  if (isLoading || !metric) {
    return (
      <Card className="p-4 border border-border/60 bg-card">
        <Skeleton className="h-4 w-28 mb-3" />
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-24" />
      </Card>
    );
  }

  const { current, percentageChange, trendDirection } = metric;

  const isUp = trendDirection === "UP";
  const isDown = trendDirection === "DOWN";

  // Determine badge styling based on whether UP is good or bad
  let badgeColor = "bg-muted text-muted-foreground border-border";
  if (isUp) {
    badgeColor = invertColorLogic
      ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
      : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  } else if (isDown) {
    badgeColor = invertColorLogic
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      : "bg-amber-500/10 text-amber-600 border-amber-500/20";
  }

  return (
    <Card className="p-4 border border-border/60 bg-card hover:border-indigo-500/30 transition-colors shadow-sm">
      <CardContent className="p-0 flex flex-col justify-between h-full space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          {icon && <div className="p-2 rounded-lg bg-muted/60 text-muted-foreground">{icon}</div>}
        </div>

        <div>
          <div className="text-2xl font-black tracking-tight text-foreground">
            {formatter(current)}
          </div>

          <div className="flex items-center space-x-2 mt-1.5">
            <Badge variant="outline" className={`text-xs px-1.5 py-0.5 font-bold ${badgeColor}`}>
              {isUp && <ArrowUpRight className="w-3 h-3 mr-0.5 inline" />}
              {isDown && <ArrowDownRight className="w-3 h-3 mr-0.5 inline" />}
              {!isUp && !isDown && <Minus className="w-3 h-3 mr-0.5 inline" />}
              {percentageChange !== null
                ? `${percentageChange > 0 ? "+" : ""}${percentageChange}%`
                : "New"}
            </Badge>
            <span className="text-[11px] text-muted-foreground">vs previous period</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
