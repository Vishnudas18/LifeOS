import { Types } from "mongoose";
import { User, IUser, DEFAULT_USER_PREFERENCES } from "../models/User.js";
import { UpdateSettingsInput } from "../validators/settings.validator.js";

export class SettingsRepository {
  /**
   * Finds user by ObjectId and populates default preferences if missing
   */
  async findUserWithSettings(userId: string): Promise<IUser | null> {
    const user = await User.findById(userId).exec();
    if (!user) return null;

    // Ensure preferences object is hydrated with defaults if empty
    if (!user.preferences) {
      user.preferences = { ...DEFAULT_USER_PREFERENCES };
      await user.save();
    }
    return user;
  }

  /**
   * Updates user profile and preferences via deep merge
   */
  async updateUserSettings(
    userId: string,
    input: UpdateSettingsInput
  ): Promise<IUser | null> {
    const user = await this.findUserWithSettings(userId);
    if (!user) return null;

    if (input.name !== undefined) user.name = input.name;
    if (input.avatarUrl !== undefined) user.avatarUrl = input.avatarUrl;

    if (input.preferences) {
      const p = input.preferences;
      const currentPref = user.preferences || { ...DEFAULT_USER_PREFERENCES };

      if (p.timezone !== undefined) currentPref.timezone = p.timezone;
      if (p.locale !== undefined) currentPref.locale = p.locale;
      if (p.currency !== undefined) currentPref.currency = p.currency;
      if (p.dateFormat !== undefined) currentPref.dateFormat = p.dateFormat;
      if (p.timeFormat !== undefined) currentPref.timeFormat = p.timeFormat;
      if (p.weekStartsOn !== undefined) currentPref.weekStartsOn = p.weekStartsOn;
      if (p.theme !== undefined) currentPref.theme = p.theme;

      if (p.notifications) {
        currentPref.notifications = {
          ...currentPref.notifications,
          ...p.notifications,
        };
      }

      if (p.focus) {
        currentPref.focus = {
          ...currentPref.focus,
          ...p.focus,
        };
      }

      if (p.calendar) {
        currentPref.calendar = {
          ...currentPref.calendar,
          ...p.calendar,
        };
      }

      user.preferences = currentPref;
    }

    await user.save();
    return user;
  }

  /**
   * Resets user preferences back to system defaults
   */
  async resetUserSettings(userId: string): Promise<IUser | null> {
    const user = await this.findUserWithSettings(userId);
    if (!user) return null;

    user.preferences = JSON.parse(JSON.stringify(DEFAULT_USER_PREFERENCES));
    await user.save();
    return user;
  }
}
