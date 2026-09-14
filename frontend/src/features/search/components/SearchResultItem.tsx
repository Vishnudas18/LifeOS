import React from "react";
import { useNavigate } from "react-router-dom";
import type { SearchResultDTO, SearchEntityType } from "../types/search";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Target,
  Flag,
  CreditCard,
  Calendar,
  Timer,
  Bell,
  ChevronRight,
} from "lucide-react";

interface SearchResultItemProps {
  result: SearchResultDTO;
  onSelect?: () => void;
  isSelected?: boolean;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  onSelect,
  isSelected = false,
}) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (onSelect) onSelect();
    navigate(result.url);
  };

  const getIcon = (type: SearchEntityType) => {
    switch (type) {
      case "TASK":
        return <CheckSquare className="w-4 h-4 text-blue-500" />;
      case "GOAL":
        return <Target className="w-4 h-4 text-emerald-500" />;
      case "MILESTONE":
        return <Flag className="w-4 h-4 text-amber-500" />;
      case "TRANSACTION":
        return <CreditCard className="w-4 h-4 text-rose-500" />;
      case "CALENDAR_EVENT":
        return <Calendar className="w-4 h-4 text-indigo-500" />;
      case "FOCUS_SESSION":
        return <Timer className="w-4 h-4 text-purple-500" />;
      case "NOTIFICATION":
      default:
        return <Bell className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTypeBadge = (type: SearchEntityType) => {
    switch (type) {
      case "TASK":
        return (
          <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/20">
            Task
          </Badge>
        );
      case "GOAL":
        return (
          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            Goal
          </Badge>
        );
      case "MILESTONE":
        return (
          <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20">
            Milestone
          </Badge>
        );
      case "TRANSACTION":
        return (
          <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-500 border-rose-500/20">
            Transaction
          </Badge>
        );
      case "CALENDAR_EVENT":
        return (
          <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
            Calendar
          </Badge>
        );
      case "FOCUS_SESSION":
        return (
          <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-500 border-purple-500/20">
            Focus
          </Badge>
        );
      case "NOTIFICATION":
      default:
        return (
          <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            Notification
          </Badge>
        );
    }
  };

  const renderSubtitle = () => {
    const m = result.metadata || {};
    switch (result.type) {
      case "TASK":
        return `${m.priority ? `${m.priority} priority` : ""} ${m.status ? `· ${m.status}` : ""} ${m.category ? `· ${m.category}` : ""}`.trim();
      case "GOAL":
        return `${m.progress !== undefined ? `${m.progress}% complete` : ""} ${m.category ? `· ${m.category}` : ""}`.trim();
      case "MILESTONE":
        return `${m.status ? `Status: ${m.status}` : ""}`.trim();
      case "TRANSACTION": {
        const amt = m.amount ? `₹${(m.amount / 100).toFixed(2)}` : "";
        return `${m.type || "Expense"} ${amt ? `· ${amt}` : ""} ${m.category ? `· ${m.category}` : ""}`.trim();
      }
      case "CALENDAR_EVENT":
        return `${m.type || "Event"} ${m.location ? `· ${m.location}` : ""}`.trim();
      case "FOCUS_SESSION": {
        const durationMins = m.actualDuration ? Math.round(m.actualDuration / 60) : Math.round((m.plannedDuration || 0) / 60);
        return `${m.mode || "Focus"} ${durationMins ? `· ${durationMins}m` : ""}`.trim();
      }
      case "NOTIFICATION":
        return `${m.type || "System"}`;
      default:
        return "";
    }
  };

  return (
    <div
      onClick={handleNavigate}
      className={`group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? "bg-primary/10 border-primary/40 shadow-xs"
          : "bg-card border-border/50 hover:bg-muted/50 hover:border-border"
      }`}
    >
      <div className="flex items-start space-x-3 min-w-0 flex-1">
        <div className="p-2 rounded-lg bg-background border border-border/60 shadow-2xs flex-shrink-0 mt-0.5">
          {getIcon(result.type)}
        </div>

        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center space-x-2">
            <h4 className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {result.title}
            </h4>
            {getTypeBadge(result.type)}
          </div>

          {result.description && (
            <p className="text-[11px] text-muted-foreground truncate leading-tight">
              {result.description}
            </p>
          )}

          <p className="text-[10px] text-muted-foreground/80 font-medium">
            {renderSubtitle()}
          </p>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
    </div>
  );
};
