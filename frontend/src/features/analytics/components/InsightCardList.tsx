import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { InsightCardData } from "../types/analytics";
import { Sparkles, Lightbulb, AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface InsightCardListProps {
  insights: InsightCardData[] | undefined;
  isLoading: boolean;
}

export const InsightCardList: React.FC<InsightCardListProps> = ({
  insights,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card className="border border-border/60 bg-card p-6">
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </Card>
    );
  }

  if (!insights || insights.length === 0) {
    return null;
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "POSITIVE":
        return {
          cardBg: "bg-emerald-500/5 border-emerald-500/30",
          iconColor: "text-emerald-500",
          icon: CheckCircle2,
          badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        };
      case "WARNING":
        return {
          cardBg: "bg-amber-500/5 border-amber-500/30",
          iconColor: "text-amber-500",
          icon: AlertTriangle,
          badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        };
      case "INFO":
      default:
        return {
          cardBg: "bg-indigo-500/5 border-indigo-500/30",
          iconColor: "text-indigo-500",
          icon: Info,
          badge: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
        };
    }
  };

  return (
    <Card className="border border-border/60 bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <CardTitle className="text-base font-bold">Actionable Insights</CardTitle>
        </div>
        <Badge variant="outline" className="text-xs font-medium">
          <Sparkles className="w-3 h-3 mr-1 text-indigo-500 inline" />
          Rule Engine Derived
        </Badge>
      </CardHeader>

      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => {
          const style = getSeverityStyle(insight.severity);
          const IconComp = style.icon;

          return (
            <div
              key={insight.id}
              className={`p-4 rounded-xl border transition-colors flex items-start space-x-3.5 ${style.cardBg}`}
            >
              <div className={`p-2 rounded-lg bg-background border shadow-xs ${style.iconColor}`}>
                <IconComp className="w-4 h-4" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">{insight.title}</h4>
                  <Badge variant="outline" className={`text-[10px] uppercase font-semibold px-1.5 py-0 ${style.badge}`}>
                    {insight.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {insight.message}
                </p>
                {insight.metric && insight.currentValue !== undefined && (
                  <div className="pt-1.5 text-[11px] font-semibold text-foreground/80 flex items-center justify-between">
                    <span>{insight.metric}:</span>
                    <span className="font-bold">{insight.currentValue}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
