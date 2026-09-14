import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { calendarService } from "../services/calendarService";
import type {
  CalendarEvent,
  CalendarQueryFilters,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from "../types/calendar";

export function useCalendarEvents(filters: CalendarQueryFilters = {}) {
  return useQuery<CalendarEvent[], Error>({
    queryKey: ["calendar-events", filters],
    queryFn: () => calendarService.getEvents(filters),
    enabled: !!filters.start && !!filters.end,
  });
}

export function useCalendarEvent(eventId: string) {
  return useQuery<CalendarEvent, Error>({
    queryKey: ["calendar-event", eventId],
    queryFn: () => calendarService.getEventById(eventId),
    enabled: !!eventId,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCalendarEventInput) =>
      calendarService.createEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateCalendarEventInput;
    }) => calendarService.updateEvent(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      queryClient.invalidateQueries({
        queryKey: ["calendar-event", variables.id],
      });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}
