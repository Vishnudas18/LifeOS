import { apiClient } from "@/services/apiClient";
import type {
  OverviewAnalytics,
  DashboardAnalytics,
  ProductivityAnalytics,
  FinancialAnalytics,
  GoalAnalytics,
  FocusAnalytics,
  CalendarAnalytics,
  InsightCardData,
} from "../types/analytics";

function buildQueryString(start?: string, end?: string): string {
  const params = new URLSearchParams();
  if (start) params.append("start", start);
  if (end) params.append("end", end);
  const q = params.toString();
  return q ? `?${q}` : "";
}

export const analyticsService = {
  async getDashboard(todayStart: string, monthStart: string): Promise<DashboardAnalytics> {
    const params = new URLSearchParams({ todayStart, monthStart });
    const res = await apiClient<DashboardAnalytics>(`/analytics/dashboard?${params.toString()}`);
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch dashboard data");
    }
    return res.data;
  },

  async getOverview(start?: string, end?: string): Promise<OverviewAnalytics> {
    const res = await apiClient<OverviewAnalytics>(`/analytics/overview${buildQueryString(start, end)}`);
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch analytics overview");
    }
    return res.data;
  },

  async getProductivity(start?: string, end?: string): Promise<ProductivityAnalytics> {
    const res = await apiClient<ProductivityAnalytics>(`/analytics/productivity${buildQueryString(start, end)}`);
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch productivity analytics");
    }
    return res.data;
  },

  async getFinancial(start?: string, end?: string): Promise<FinancialAnalytics> {
    const res = await apiClient<FinancialAnalytics>(`/analytics/financial${buildQueryString(start, end)}`);
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch financial analytics");
    }
    return res.data;
  },

  async getGoals(start?: string, end?: string): Promise<GoalAnalytics> {
    const res = await apiClient<GoalAnalytics>(`/analytics/goals${buildQueryString(start, end)}`);
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch goal analytics");
    }
    return res.data;
  },

  async getFocus(start?: string, end?: string): Promise<FocusAnalytics> {
    const res = await apiClient<FocusAnalytics>(`/analytics/focus${buildQueryString(start, end)}`);
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch focus analytics");
    }
    return res.data;
  },

  async getCalendar(start?: string, end?: string): Promise<CalendarAnalytics> {
    const res = await apiClient<CalendarAnalytics>(`/analytics/calendar${buildQueryString(start, end)}`);
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch calendar analytics");
    }
    return res.data;
  },

  async getInsights(start?: string, end?: string): Promise<InsightCardData[]> {
    const res = await apiClient<{ insights: InsightCardData[] }>(`/analytics/insights${buildQueryString(start, end)}`);
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch analytics insights");
    }
    return res.data.insights;
  },
};
