import { apiClient } from "@/services/apiClient";
import type {
  CalendarEvent,
  CalendarQueryFilters,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from "../types/calendar";

export const calendarService = {
  async getEvents(filters: CalendarQueryFilters = {}): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    if (filters.start) params.append("start", filters.start);
    if (filters.end) params.append("end", filters.end);
    if (filters.type && filters.type !== "ALL") params.append("type", filters.type);
    if (filters.status && filters.status !== "ALL") params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);

    const queryString = params.toString();
    const endpoint = `/calendar/events${queryString ? `?${queryString}` : ""}`;
    const res = await apiClient<{ events: CalendarEvent[] }>(endpoint);

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch calendar events");
    }

    return res.data.events;
  },

  async getEventById(id: string): Promise<CalendarEvent> {
    const res = await apiClient<{ event: CalendarEvent }>(`/calendar/events/${id}`);
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch calendar event details");
    }
    return res.data.event;
  },

  async createEvent(input: CreateCalendarEventInput): Promise<CalendarEvent> {
    const res = await apiClient<{ event: CalendarEvent }>("/calendar/events", {
      method: "POST",
      body: JSON.stringify(input),
    });

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to create calendar event");
    }

    return res.data.event;
  },

  async updateEvent(id: string, input: UpdateCalendarEventInput): Promise<CalendarEvent> {
    const res = await apiClient<{ event: CalendarEvent }>(`/calendar/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to update calendar event");
    }

    return res.data.event;
  },

  async deleteEvent(id: string): Promise<void> {
    const res = await apiClient<null>(`/calendar/events/${id}`, {
      method: "DELETE",
    });

    if (!res.success) {
      throw new Error(res.message || "Failed to delete calendar event");
    }
  },
};
