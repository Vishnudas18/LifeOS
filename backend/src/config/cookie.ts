import { Response, CookieOptions } from "express";
import { env } from "./env.js";

export const getCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
  path: "/api/v1/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(env.COOKIE_NAME, token, getCookieOptions());
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(env.COOKIE_NAME, {
    ...getCookieOptions(),
    maxAge: 0,
  });
}
