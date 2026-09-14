import { SettingsRepository } from "../repositories/settings.repository.js";
import { UserSettingsDTO } from "../types/settings.types.js";
import { UpdateSettingsInput } from "../validators/settings.validator.js";
import { DEFAULT_USER_PREFERENCES } from "../models/User.js";

export class SettingsService {
  private settingsRepository: SettingsRepository;

  constructor(settingsRepository = new SettingsRepository()) {
    this.settingsRepository = settingsRepository;
  }

  private mapToDTO(user: any): UserSettingsDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
      preferences: user.preferences
        ? user.preferences
        : JSON.parse(JSON.stringify(DEFAULT_USER_PREFERENCES)),
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : new Date().toISOString(),
    };
  }

  async getUserSettings(userId: string): Promise<UserSettingsDTO> {
    const user = await this.settingsRepository.findUserWithSettings(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return this.mapToDTO(user);
  }

  async updateUserSettings(
    userId: string,
    input: UpdateSettingsInput
  ): Promise<UserSettingsDTO> {
    const updatedUser = await this.settingsRepository.updateUserSettings(userId, input);
    if (!updatedUser) {
      throw new Error("Failed to update user settings");
    }
    return this.mapToDTO(updatedUser);
  }

  async resetUserSettings(userId: string): Promise<UserSettingsDTO> {
    const resetUser = await this.settingsRepository.resetUserSettings(userId);
    if (!resetUser) {
      throw new Error("Failed to reset user settings");
    }
    return this.mapToDTO(resetUser);
  }
}
