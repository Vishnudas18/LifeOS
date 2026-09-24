import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analyticsService";
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

export function useDashboardAnalytics(todayStart: string, monthStart: string) {
  return useQuery<DashboardAnalytics, Error>({
    queryKey: ["dashboard-analytics", todayStart, monthStart],
    queryFn: () => analyticsService.getDashboard(todayStart, monthStart),
  });
}

export function useAnalyticsOverview(start?: string, end?: string) {
  return useQuery<OverviewAnalytics, Error>({
    queryKey: ["analytics-overview", start, end],
    queryFn: () => analyticsService.getOverview(start, end),
  });
}

export function useProductivityAnalytics(start?: string, end?: string) {
  return useQuery<ProductivityAnalytics, Error>({
    queryKey: ["analytics-productivity", start, end],
    queryFn: () => analyticsService.getProductivity(start, end),
  });
}

export function useFinancialAnalytics(start?: string, end?: string) {
  return useQuery<FinancialAnalytics, Error>({
    queryKey: ["analytics-financial", start, end],
    queryFn: () => analyticsService.getFinancial(start, end),
  });
}

export function useGoalAnalytics(start?: string, end?: string) {
  return useQuery<GoalAnalytics, Error>({
    queryKey: ["analytics-goals", start, end],
    queryFn: () => analyticsService.getGoals(start, end),
  });
}

export function useFocusAnalytics(start?: string, end?: string) {
  return useQuery<FocusAnalytics, Error>({
    queryKey: ["analytics-focus", start, end],
    queryFn: () => analyticsService.getFocus(start, end),
  });
}

export function useCalendarAnalytics(start?: string, end?: string) {
  return useQuery<CalendarAnalytics, Error>({
    queryKey: ["analytics-calendar", start, end],
    queryFn: () => analyticsService.getCalendar(start, end),
  });
}

export function useAnalyticsInsights(start?: string, end?: string) {
  return useQuery<InsightCardData[], Error>({
    queryKey: ["analytics-insights", start, end],
    queryFn: () => analyticsService.getInsights(start, end),
  });
}
