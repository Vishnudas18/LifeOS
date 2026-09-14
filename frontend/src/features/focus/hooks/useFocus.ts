import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { focusService } from "../services/focusService";
import type {
  FocusSession,
  CreateFocusSessionInput,
  FocusQueryFilters,
  FocusSummary,
} from "../types/focus";

export function useActiveFocusSession() {
  return useQuery<FocusSession | null, Error>({
    queryKey: ["focus-active"],
    queryFn: () => focusService.getActiveSession(),
    staleTime: 1000 * 5, // 5 seconds
    refetchOnWindowFocus: true,
  });
}

export function useFocusSessions(filters: FocusQueryFilters = {}) {
  return useQuery<{ sessions: FocusSession[]; total: number; page: number; limit: number }, Error>({
    queryKey: ["focus-sessions", filters],
    queryFn: () => focusService.getSessions(filters),
  });
}

export function useFocusSummary(startDate?: string, endDate?: string) {
  return useQuery<FocusSummary, Error>({
    queryKey: ["focus-summary", startDate, endDate],
    queryFn: () => focusService.getSummary(startDate, endDate),
  });
}

export function useStartFocusSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFocusSessionInput) => focusService.startSession(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus-active"] });
      queryClient.invalidateQueries({ queryKey: ["focus-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["focus-summary"] });
    },
  });
}

export function usePauseFocusSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => focusService.pauseSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus-active"] });
      queryClient.invalidateQueries({ queryKey: ["focus-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["focus-summary"] });
    },
  });
}

export function useResumeFocusSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => focusService.resumeSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus-active"] });
      queryClient.invalidateQueries({ queryKey: ["focus-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["focus-summary"] });
    },
  });
}

export function useCompleteFocusSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => focusService.completeSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus-active"] });
      queryClient.invalidateQueries({ queryKey: ["focus-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["focus-summary"] });
    },
  });
}

export function useCancelFocusSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => focusService.cancelSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus-active"] });
      queryClient.invalidateQueries({ queryKey: ["focus-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["focus-summary"] });
    },
  });
}
