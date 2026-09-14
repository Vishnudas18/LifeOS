import { useNavigate } from "react-router-dom";
import {
  Calendar,
  AlertTriangle,
  Flag,
  Tag,
  Edit2,
  Trash2,
  ChevronRight,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GoalProgress } from "./GoalProgress";
import type { Goal } from "../types/goal";

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const navigate = useNavigate();

  const isOverdue =
    goal.targetDate &&
    new Date(goal.targetDate) < new Date() &&
    goal.status !== "COMPLETED" &&
    goal.status !== "CANCELLED";

  const statusBadgeVariant = (status: Goal["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "IN_PROGRESS":
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "ON_HOLD":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "CANCELLED":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const priorityColor = (priority: Goal["priority"]) => {
    switch (priority) {
      case "HIGH":
        return "text-rose-500 dark:text-rose-400";
      case "MEDIUM":
        return "text-amber-500 dark:text-amber-400";
      case "LOW":
        return "text-emerald-500 dark:text-emerald-400";
    }
  };

  const milestoneTotal = goal.milestoneStats?.total || 0;
  const milestoneCompleted = goal.milestoneStats?.completed || 0;

  return (
    <Card
      className="group relative flex flex-col justify-between hover:shadow-lg transition-all duration-300 border border-border/80 hover:border-primary/40 cursor-pointer overflow-hidden"
      onClick={() => navigate(`/goals/${goal._id}`)}
    >
      {/* Top indicator bar */}
      <div
        className={`h-1 w-full ${
          goal.status === "COMPLETED"
            ? "bg-emerald-500"
            : goal.status === "IN_PROGRESS"
            ? "bg-blue-500"
            : goal.status === "ON_HOLD"
            ? "bg-amber-500"
            : "bg-muted-foreground/30"
        }`}
      />

      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadgeVariant(goal.status)}`}>
                {goal.status.replace("_", " ")}
              </Badge>

              <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-full text-muted-foreground font-normal flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {goal.category}
              </Badge>

              <span className={`text-xs font-semibold flex items-center gap-1 ${priorityColor(goal.priority)}`}>
                <Flag className="h-3 w-3" />
                {goal.priority}
              </span>
            </div>

            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {goal.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(goal)}
              title="Edit Goal"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(goal)}
              title="Delete Goal"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {goal.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
            {goal.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-5 pt-2 pb-3 space-y-4">
        {/* Progress Bar */}
        <GoalProgress progress={goal.progress} size="md" />

        {/* Milestone ratio & target date summary */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/50 text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span>
              {milestoneCompleted} / {milestoneTotal} Milestones
            </span>
          </div>

          {goal.targetDate && (
            <div
              className={`flex items-center gap-1.5 font-medium justify-end ${
                isOverdue ? "text-rose-600 dark:text-rose-400 font-semibold" : ""
              }`}
            >
              {isOverdue ? (
                <>
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                  <span>Overdue ({new Date(goal.targetDate).toLocaleDateString()})</span>
                </>
              ) : (
                <>
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2 pb-3 bg-muted/20 border-t border-border/40 flex items-center justify-between text-xs text-primary font-semibold group-hover:bg-primary/5 transition-colors">
        <span>View details & roadmap</span>
        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </CardFooter>
    </Card>
  );
}
