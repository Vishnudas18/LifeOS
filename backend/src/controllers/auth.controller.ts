import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import {
  registerService,
  loginService,
  refreshService,
  logoutService,
  getUserProfileService,
} from "../services/auth.service.js";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../config/cookie.js";
import { sendSuccess } from "../utils/response.js";
import { env } from "../config/env.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

const getMeta = (req: Request) => ({
  ipAddress: req.ip || (req.headers["x-forwarded-for"] as string) || undefined,
  userAgent: req.headers["user-agent"] || undefined,
});

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = registerSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await registerService(input, getMeta(req));

    setRefreshTokenCookie(res, refreshToken);
    sendSuccess(res, { user, accessToken }, "Registration successful", 201);
  } catch (error) {
    next(error);
  }
}

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await loginService(input, getMeta(req));

    setRefreshTokenCookie(res, refreshToken);
    sendSuccess(res, { user, accessToken }, "Login successful", 200);
  } catch (error) {
    next(error);
  }
}

export async function refreshController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawRefreshToken = req.cookies?.[env.COOKIE_NAME];
    const { accessToken, refreshToken: newRefreshToken } = await refreshService(
      rawRefreshToken,
      getMeta(req)
    );

    setRefreshTokenCookie(res, newRefreshToken);
    sendSuccess(res, { accessToken }, "Token refreshed successfully");
  } catch (error) {
    clearRefreshTokenCookie(res);
    next(error);
  }
}

export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawRefreshToken = req.cookies?.[env.COOKIE_NAME];
    await logoutService(rawRefreshToken, getMeta(req));
    clearRefreshTokenCookie(res);

    sendSuccess(res, null, "Logout successful");
  } catch (error) {
    clearRefreshTokenCookie(res);
    next(error);
  }
}

export async function getMeController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const user = await getUserProfileService(userId);
    sendSuccess(res, { user }, "User profile retrieved");
  } catch (error) {
    next(error);
  }
}
