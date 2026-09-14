import { Router } from "express";
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  getMeController,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const authRouter = Router();

authRouter.post("/register", authLimiter, registerController);
authRouter.post("/login", authLimiter, loginController);
authRouter.post("/refresh", authLimiter, refreshController);
authRouter.post("/logout", logoutController);
authRouter.get("/me", authenticate, getMeController);

export default authRouter;
