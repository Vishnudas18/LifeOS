import { useNavigate } from "react-router-dom";
import {
  X,
  Clock,
  MapPin,
  Edit2,
  Trash2,
  CheckCircle2,
  Target,
  ListTodo,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CalendarEvent, EventStatus } from "../types/calendar";

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
  onStatusChange: (event: CalendarEvent, status: EventStatus) => Promise<void>;
}

export function EventDetailsModal({
  isOpen,
  onClose,
  event,
  onEdit,
  onDelete,
  onStatusChange,
}: EventDetailsModalProps) {
  const navigate = useNavigate();

  if (!isOpen || !event) return null;

  const startFormatted = new Date(event.startDateTime).toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  });

  const endFormatted = new Date(event.endDateTime).toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Top color indicator bar */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: event.color || "#3b82f6" }}
        />

        <CardHeader className="pb-3 flex flex-row items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5">
                {event.status}
              </Badge>
              <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5">
                {event.type}
              </Badge>
              {event.allDay && (
                <span className="text-xs text-primary font-medium">All-Day</span>
              )}
            </div>

            <CardTitle className="text-lg font-bold text-foreground">
              {event.title}
            </CardTitle>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          {/* Timing details */}
          <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 border border-border/50">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>{startFormatted}</span>
            </div>
            <div className="text-muted-foreground pl-6 text-[11px]">
              to {endFormatted} ({event.timezone || "Local Time"})
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="font-medium text-foreground">{event.location}</span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="space-y-1">
              <div className="font-semibold text-foreground">Description & Notes:</div>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bg-background p-3 rounded-lg border border-border/60">
                {event.description}
              </p>
            </div>
          )}

          {/* Linked Goal / Task References */}
          {(event.goalId || event.taskId) && (
            <div className="pt-2 border-t border-border/60 space-y-2">
              <div className="font-semibold text-foreground">Linked Objects:</div>
              <div className="flex flex-wrap gap-2">
                {event.goalId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5"
                    onClick={() => {
                      onClose();
                      navigate(`/goals/${event.goalId}`);
                    }}
                  >
                    <Target className="h-3.5 w-3.5 text-primary" />
                    <span>View Goal</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </Button>
                )}

                {event.taskId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5"
                    onClick={() => {
                      onClose();
                      navigate("/tasks");
                    }}
                  >
                    <ListTodo className="h-3.5 w-3.5 text-primary" />
                    <span>View Task</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between p-4 border-t bg-muted/20">
          {/* Status Actions */}
          <div className="flex items-center gap-1">
            {event.status !== "COMPLETED" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10"
                onClick={() => onStatusChange(event, "COMPLETED")}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Mark Completed
              </Button>
            )}

            {event.status === "COMPLETED" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-amber-600 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/10"
                onClick={() => onStatusChange(event, "SCHEDULED")}
              >
                Reopen Event
              </Button>
            )}
          </div>

          {/* Edit & Delete Actions */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                onClose();
                onEdit(event);
              }}
            >
              <Edit2 className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8"
              onClick={() => {
                onClose();
                onDelete(event);
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
