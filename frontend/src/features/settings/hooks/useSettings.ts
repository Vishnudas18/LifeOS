import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "../services/settingsService";
import type { UserSettingsDTO, UpdateSettingsInput } from "../types/settings";

export function useUserSettings() {
  return useQuery<UserSettingsDTO, Error>({
    queryKey: ["user-settings"],
    queryFn: () => settingsService.getSettings(),
    staleTime: 1000 * 60 * 5, // 5 minute stale time
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => settingsService.updateSettings(input),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(["user-settings"], updatedSettings);
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
    },
  });
}

export function useResetSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => settingsService.resetSettings(),
    onSuccess: (resetSettings) => {
      queryClient.setQueryData(["user-settings"], resetSettings);
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
    },
  });
}
