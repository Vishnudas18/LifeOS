import { useState } from "react";
import { Calendar as CalendarIcon, Plus, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarView } from "../components/CalendarView";
import { CalendarFilters } from "../components/CalendarFilters";
import { EventDialog } from "../components/EventDialog";
import { EventDetailsModal } from "../components/EventDetailsModal";
import { DeleteEventConfirmModal } from "../components/DeleteEventConfirmModal";
import {
  useCalendarEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from "../hooks/useCalendar";
import type {
  CalendarEvent,
  CalendarQueryFilters,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
  EventStatus,
} from "../types/calendar";

export function CalendarPage() {
  // Visible date range state for FullCalendar
  const [range, setRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().setDate(1)).toISOString(),
    end: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
  });

  const [filters, setFilters] = useState<CalendarQueryFilters>({
    type: "ALL",
    status: "ALL",
    search: "",
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [initialDates, setInitialDates] = useState<{ start: string; end: string } | null>(null);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);

  // Combine range and filters for Query
  const queryFilters: CalendarQueryFilters = {
    start: range.start,
    end: range.end,
    ...filters,
  };

  const { data: events, isLoading, isError, error, refetch } = useCalendarEvents(queryFilters);
  const createEventMutation = useCreateCalendarEvent();
  const updateEventMutation = useUpdateCalendarEvent();
  const deleteEventMutation = useDeleteCalendarEvent();

  const handleRangeChange = (startIso: string, endIso: string) => {
    setRange({ start: startIso, end: endIso });
  };

  const handleResetFilters = () => {
    setFilters({
      type: "ALL",
      status: "ALL",
      search: "",
    });
  };

  const handleCreateOrEditSubmit = async (input: CreateCalendarEventInput) => {
    if (eventToEdit) {
      await updateEventMutation.mutateAsync({
        id: eventToEdit._id,
        input: input as UpdateCalendarEventInput,
      });
    } else {
      await createEventMutation.mutateAsync(input);
    }
  };

  const handleDateSelect = (startIso: string, endIso: string) => {
    setEventToEdit(null);
    setInitialDates({ start: startIso, end: endIso });
    setIsCreateOpen(true);
  };

  const handleEventDrop = async (
    eventId: string,
    newStartIso: string,
    newEndIso: string,
    revert: () => void
  ) => {
    try {
      await updateEventMutation.mutateAsync({
        id: eventId,
        input: {
          startDateTime: newStartIso,
          endDateTime: newEndIso,
        },
      });
    } catch {
      revert();
      alert("Failed to reschedule event. Drag-and-drop was reverted.");
    }
  };

  const handleEventResize = async (
    eventId: string,
    newStartIso: string,
    newEndIso: string,
    revert: () => void
  ) => {
    try {
      await updateEventMutation.mutateAsync({
        id: eventId,
        input: {
          startDateTime: newStartIso,
          endDateTime: newEndIso,
        },
      });
    } catch {
      revert();
      alert("Failed to adjust event duration. Resize was reverted.");
    }
  };

  const handleStatusChange = async (event: CalendarEvent, status: EventStatus) => {
    await updateEventMutation.mutateAsync({
      id: event._id,
      input: { status },
    });
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    await deleteEventMutation.mutateAsync(eventToDelete._id);
    setEventToDelete(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Calendar & Schedule
          </h1>
          <p className="text-sm text-muted-foreground">
            Schedule meetings, deadlines, and task reminders in a unified interactive calendar.
          </p>
        </div>

        <Button
          onClick={() => {
            setEventToEdit(null);
            setInitialDates(null);
            setIsCreateOpen(true);
          }}
          className="sm:self-start gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Event</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <CalendarFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Error Banner */}
      {isError && (
        <Card className="border-destructive/40 bg-destructive/5 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1 text-xs text-destructive">
            {error?.message || "Failed to load calendar events."}
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      )}

      {/* Main FullCalendar Component */}
      {isLoading ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[450px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading calendar schedule...</p>
        </Card>
      ) : (
        <CalendarView
          events={events || []}
          onRangeChange={handleRangeChange}
          onEventClick={(event) => setSelectedEvent(event)}
          onDateSelect={handleDateSelect}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
        />
      )}

      {/* Modals */}
      <EventDialog
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEventToEdit(null);
          setInitialDates(null);
        }}
        onSubmit={handleCreateOrEditSubmit}
        eventToEdit={eventToEdit}
        initialDates={initialDates}
        isLoading={createEventMutation.isPending || updateEventMutation.isPending}
      />

      <EventDetailsModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        onEdit={(evt) => {
          setEventToEdit(evt);
          setIsCreateOpen(true);
        }}
        onDelete={(evt) => setEventToDelete(evt)}
        onStatusChange={handleStatusChange}
      />

      <DeleteEventConfirmModal
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleDeleteConfirm}
        event={eventToDelete}
        isLoading={deleteEventMutation.isPending}
      />
    </div>
  );
}
