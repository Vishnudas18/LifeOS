import Types from "mongoose";
import { User, IUser } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
} from "../utils/jwt.js";
import { RegisterInput, LoginInput } from "../validators/auth.validator.js";
import { logAuditEvent } from "./auditLog.service.js";

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = "AuthError";
  }
}

export interface SessionContext {
  ipAddress?: string;
  userAgent?: string;
}

export async function registerService(input: RegisterInput, meta?: SessionContext) {
  const existingUser = await User.findOne({ email: input.email.toLowerCase() });
  if (existingUser) {
    throw new AuthError("User with this email already exists", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
  });

  // Create session refresh token
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const refreshTokenDoc = await RefreshToken.create({
    userId: user._id,
    tokenHash: "temp",
    expiresAt,
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });

  const rawRefreshToken = generateRefreshToken(
    user._id.toString(),
    refreshTokenDoc._id.toString()
  );

  const tokenHash = hashRefreshToken(rawRefreshToken);
  refreshTokenDoc.tokenHash = tokenHash;
  await refreshTokenDoc.save();

  const accessToken = generateAccessToken(user._id.toString());

  await logAuditEvent({
    userId: user._id.toString(),
    action: "REGISTER",
    status: "SUCCESS",
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken: rawRefreshToken,
  };
}

export async function loginService(input: LoginInput, meta?: SessionContext) {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (!user) {
    await logAuditEvent({
      action: "LOGIN_FAILURE",
      status: "FAILURE",
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
      details: { email: input.email.toLowerCase() },
    });
    throw new AuthError("Invalid email or password", 401);
  }

  const isPasswordValid = await verifyPassword(user.passwordHash, input.password);
  if (!isPasswordValid) {
    await logAuditEvent({
      userId: user._id.toString(),
      action: "LOGIN_FAILURE",
      status: "FAILURE",
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });
    throw new AuthError("Invalid email or password", 401);
  }

  // Create session refresh token
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const refreshTokenDoc = await RefreshToken.create({
    userId: user._id,
    tokenHash: "temp",
    expiresAt,
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });

  const rawRefreshToken = generateRefreshToken(
    user._id.toString(),
    refreshTokenDoc._id.toString()
  );

  const tokenHash = hashRefreshToken(rawRefreshToken);
  refreshTokenDoc.tokenHash = tokenHash;
  await refreshTokenDoc.save();

  const accessToken = generateAccessToken(user._id.toString());

  await logAuditEvent({
    userId: user._id.toString(),
    action: "LOGIN_SUCCESS",
    status: "SUCCESS",
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken: rawRefreshToken,
  };
}

export async function refreshService(rawRefreshToken: string | undefined, meta?: SessionContext) {
  if (!rawRefreshToken) {
    throw new AuthError("Refresh token missing", 401);
  }

  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AuthError("Invalid or expired refresh token", 401);
  }

  const tokenHash = hashRefreshToken(rawRefreshToken);
  const storedToken = await RefreshToken.findOne({
    _id: payload.jti,
    tokenHash,
  });

  if (!storedToken) {
    await logAuditEvent({
      userId: payload.userId,
      action: "REFRESH_FAILURE",
      status: "FAILURE",
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });
    throw new AuthError("Invalid or revoked refresh token", 401);
  }

  // Token Reuse Detection: If token was already revoked, trigger family revocation & security alert
  if (storedToken.revokedAt) {
    await RefreshToken.updateMany(
      { userId: storedToken.userId, $or: [{ revokedAt: null }, { revokedAt: { $exists: false } }] },
      { $set: { revokedAt: new Date() } }
    );
    await logAuditEvent({
      userId: storedToken.userId.toString(),
      action: "REFRESH_TOKEN_REUSE_DETECTED",
      status: "ALERT",
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
      details: { tokenId: storedToken._id.toString() },
    });
    throw new AuthError("Invalid or revoked refresh token", 401);
  }

  if (storedToken.expiresAt < new Date()) {
    throw new AuthError("Invalid or expired refresh token", 401);
  }

  // Create new refresh token session doc
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const newRefreshTokenDoc = await RefreshToken.create({
    userId: storedToken.userId,
    tokenHash: "temp",
    expiresAt,
    ipAddress: meta?.ipAddress || storedToken.ipAddress,
    userAgent: meta?.userAgent || storedToken.userAgent,
  });

  // Token Rotation: Mark old token as revoked, last used, and link to replacedBy
  storedToken.revokedAt = new Date();
  storedToken.lastUsedAt = new Date();
  storedToken.replacedBy = newRefreshTokenDoc._id;
  await storedToken.save();

  const newRawRefreshToken = generateRefreshToken(
    storedToken.userId.toString(),
    newRefreshTokenDoc._id.toString()
  );

  const newTokenHash = hashRefreshToken(newRawRefreshToken);
  newRefreshTokenDoc.tokenHash = newTokenHash;
  await newRefreshTokenDoc.save();

  const accessToken = generateAccessToken(storedToken.userId.toString());

  await logAuditEvent({
    userId: storedToken.userId.toString(),
    action: "REFRESH_SUCCESS",
    status: "SUCCESS",
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });

  return {
    accessToken,
    refreshToken: newRawRefreshToken,
  };
}

export async function logoutService(rawRefreshToken: string | undefined, meta?: SessionContext) {
  if (rawRefreshToken) {
    try {
      const tokenHash = hashRefreshToken(rawRefreshToken);
      const doc = await RefreshToken.findOneAndUpdate(
        { tokenHash },
        { $set: { revokedAt: new Date(), lastUsedAt: new Date() } }
      );
      if (doc) {
        await logAuditEvent({
          userId: doc.userId.toString(),
          action: "LOGOUT",
          status: "SUCCESS",
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
        });
      }
    } catch {
      // Ignore errors during logout
    }
  }
}

export async function getUserProfileService(userId: string) {
  if (!Types.Types.ObjectId.isValid(userId)) {
    throw new AuthError("Invalid user ID", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AuthError("User not found", 404);
  }

  return (user.toJSON() as unknown) as Omit<IUser, "passwordHash">;
}
