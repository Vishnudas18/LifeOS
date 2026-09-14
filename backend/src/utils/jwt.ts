import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env.js";

export interface AccessTokenPayload {
  userId: string;
  jti?: string;
  iss?: string;
  aud?: string;
}

export interface RefreshTokenPayload {
  userId: string;
  jti: string;
  iss?: string;
  aud?: string;
}

export function generateAccessToken(userId: string): string {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as unknown as SignOptions["expiresIn"],
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    jwtid: crypto.randomUUID(),
  };
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, options);
}

export function generateRefreshToken(userId: string, tokenId: string): string {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as unknown as SignOptions["expiresIn"],
    jwtid: tokenId,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  };
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    algorithms: ["HS256"],
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  }) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    algorithms: ["HS256"],
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  }) as RefreshTokenPayload;
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
