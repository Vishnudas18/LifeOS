import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFocusSessions } from "../hooks/useFocus";
import type { FocusMode, FocusStatus } from "../types/focus";
import { formatDurationHuman } from "./FocusStats";
import { History, Filter, Target, CheckSquare, ChevronLeft, ChevronRight, Clock } from "lucide-react";

function formatSessionDateTime(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isToday) {
    return `Today · ${timeStr}`;
  }

  const dateStrFormatted = date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
  return `${dateStrFormatted} · ${timeStr}`;
}

export const FocusHistoryList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [modeFilter, setModeFilter] = useState<FocusMode | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<FocusStatus | "ALL">("ALL");

  const limit = 10;
  const { data, isLoading } = useFocusSessions({
    page,
    limit,
    mode: modeFilter,
    status: statusFilter,
  });

  const sessions = data?.sessions || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const getStatusBadge = (status: FocusStatus) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="text-muted-foreground border-border">Cancelled</Badge>;
      case "RUNNING":
        return <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 animate-pulse">Running</Badge>;
      case "PAUSED":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getModeBadge = (mode: FocusMode) => {
    switch (mode) {
      case "FOCUS":
        return <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-500">Focus</Badge>;
      case "SHORT_BREAK":
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">Short Break</Badge>;
      case "LONG_BREAK":
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">Long Break</Badge>;
      case "CUSTOM":
        return <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">Custom</Badge>;
    }
  };

  return (
    <Card className="border border-border/60 bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-indigo-500" />
          <CardTitle className="text-base font-bold">Recent Focus Sessions</CardTitle>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={modeFilter}
              onChange={(e) => {
                setModeFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-2 py-1 border rounded-md text-xs bg-background focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="ALL">All Modes</option>
              <option value="FOCUS">Focus</option>
              <option value="SHORT_BREAK">Short Break</option>
              <option value="LONG_BREAK">Long Break</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="px-2 py-1 border rounded-md text-xs bg-background focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RUNNING">Running</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
            <div className="p-3 rounded-full bg-muted">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No focus sessions found</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              No focus sessions match your criteria yet. Start your first focus session to track your productivity!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {sessions.map((sess) => {
              const taskTitle =
                typeof sess.taskId === "object" && sess.taskId ? sess.taskId.title : null;
              const goalTitle =
                typeof sess.goalId === "object" && sess.goalId ? sess.goalId.title : null;
              const durationToShow =
                sess.status === "COMPLETED"
                  ? sess.actualDuration
                  : sess.plannedDuration;

              return (
                <div
                  key={sess._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 hover:bg-muted/20 transition-colors gap-3"
                >
                  <div className="flex items-start space-x-3">
                    <div className="pt-0.5">{getModeBadge(sess.mode)}</div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-semibold text-foreground">
                          {sess.title || "Focus Session"}
                        </h4>
                        {getStatusBadge(sess.status)}
                      </div>

                      {/* Linked Entities */}
                      {(taskTitle || goalTitle) && (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-0.5">
                          {taskTitle && (
                            <span className="flex items-center truncate max-w-[200px]">
                              <CheckSquare className="w-3 h-3 mr-1 text-indigo-500 inline" />
                              {taskTitle}
                            </span>
                          )}
                          {goalTitle && (
                            <span className="flex items-center truncate max-w-[200px]">
                              <Target className="w-3 h-3 mr-1 text-emerald-500 inline" />
                              {goalTitle}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4 text-right">
                    <div>
                      <div className="text-sm font-bold text-foreground">
                        {formatDurationHuman(durationToShow)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatSessionDateTime(sess.startedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border/50 text-xs text-muted-foreground">
            <span>
              Showing {sessions.length} of {total} sessions
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <span className="font-semibold">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
