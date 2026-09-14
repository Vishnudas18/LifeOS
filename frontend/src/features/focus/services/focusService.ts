import { apiClient } from "@/services/apiClient";
import type {
  FocusSession,
  CreateFocusSessionInput,
  FocusQueryFilters,
  FocusSummary,
} from "../types/focus";

export const focusService = {
  async startSession(input: CreateFocusSessionInput): Promise<FocusSession> {
    const res = await apiClient<{ session: FocusSession }>("/focus/sessions", {
      method: "POST",
      body: JSON.stringify(input),
    });

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to start focus session");
    }
    return res.data.session;
  },

  async getActiveSession(): Promise<FocusSession | null> {
    const res = await apiClient<{ session: FocusSession | null }>("/focus/sessions/active");
    if (!res.success) {
      throw new Error(res.message || "Failed to fetch active focus session");
    }
    return res.data?.session || null;
  },

  async getSessionById(id: string): Promise<FocusSession> {
    const res = await apiClient<{ session: FocusSession }>(`/focus/sessions/${id}`);
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch focus session details");
    }
    return res.data.session;
  },

  async pauseSession(id: string): Promise<FocusSession> {
    const res = await apiClient<{ session: FocusSession }>(`/focus/sessions/${id}/pause`, {
      method: "POST",
    });

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to pause focus session");
    }
    return res.data.session;
  },

  async resumeSession(id: string): Promise<FocusSession> {
    const res = await apiClient<{ session: FocusSession }>(`/focus/sessions/${id}/resume`, {
      method: "POST",
    });

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to resume focus session");
    }
    return res.data.session;
  },

  async completeSession(id: string): Promise<FocusSession> {
    const res = await apiClient<{ session: FocusSession }>(`/focus/sessions/${id}/complete`, {
      method: "POST",
    });

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to complete focus session");
    }
    return res.data.session;
  },

  async cancelSession(id: string): Promise<FocusSession> {
    const res = await apiClient<{ session: FocusSession }>(`/focus/sessions/${id}/cancel`, {
      method: "POST",
    });

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to cancel focus session");
    }
    return res.data.session;
  },

  async getSessions(
    filters: FocusQueryFilters = {}
  ): Promise<{ sessions: FocusSession[]; total: number; page: number; limit: number }> {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.mode && filters.mode !== "ALL") params.append("mode", filters.mode);
    if (filters.status && filters.status !== "ALL") params.append("status", filters.status);
    if (filters.taskId) params.append("taskId", filters.taskId);
    if (filters.goalId) params.append("goalId", filters.goalId);

    const queryString = params.toString();
    const endpoint = `/focus/sessions${queryString ? `?${queryString}` : ""}`;
    const res = await apiClient<{
      sessions: FocusSession[];
      total: number;
      page: number;
      limit: number;
    }>(endpoint);

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch focus sessions history");
    }

    return res.data;
  },

  async getSummary(startDate?: string, endDate?: string): Promise<FocusSummary> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString();
    const endpoint = `/focus/summary${queryString ? `?${queryString}` : ""}`;
    const res = await apiClient<{ summary: FocusSummary }>(endpoint);

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch focus summary");
    }

    return res.data.summary;
  },
};
