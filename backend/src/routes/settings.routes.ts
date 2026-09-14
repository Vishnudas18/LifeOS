import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getSettingsController,
  updateSettingsController,
  resetSettingsController,
} from "../controllers/settings.controller.js";

const settingsRouter = Router();

// Protect all settings endpoints with authentication middleware
settingsRouter.use(authenticate);

settingsRouter.get("/", getSettingsController);
settingsRouter.patch("/", updateSettingsController);
settingsRouter.post("/reset", resetSettingsController);

export default settingsRouter;
