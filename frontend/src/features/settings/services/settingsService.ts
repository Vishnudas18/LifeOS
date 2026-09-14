import { apiClient } from "@/services/apiClient";
import type { UserSettingsDTO, UpdateSettingsInput } from "../types/settings";

export const settingsService = {
  async getSettings(): Promise<UserSettingsDTO> {
    const res = await apiClient<UserSettingsDTO>("/settings");
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch user settings");
    }
    return res.data;
  },

  async updateSettings(input: UpdateSettingsInput): Promise<UserSettingsDTO> {
    const res = await apiClient<UserSettingsDTO>("/settings", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to update settings");
    }
    return res.data;
  },

  async resetSettings(): Promise<UserSettingsDTO> {
    const res = await apiClient<UserSettingsDTO>("/settings/reset", {
      method: "POST",
    });
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to reset settings");
    }
    return res.data;
  },
};
