import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { SettingsService } from "../services/settings.service.js";
import { updateSettingsSchema } from "../validators/settings.validator.js";
import { sendSuccess } from "../utils/response.js";

const settingsService = new SettingsService();

export async function getSettingsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const settings = await settingsService.getUserSettings(userId);
    sendSuccess(res, settings, "User settings retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateSettingsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const input = updateSettingsSchema.parse(req.body);
    const updatedSettings = await settingsService.updateUserSettings(userId, input);
    sendSuccess(res, updatedSettings, "User settings updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function resetSettingsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const resetSettings = await settingsService.resetUserSettings(userId);
    sendSuccess(res, resetSettings, "User settings reset to defaults successfully");
  } catch (error) {
    next(error);
  }
}
