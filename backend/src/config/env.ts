import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const WEAK_SECRETS = [
  "secret",
  "supersecret",
  "password",
  "1234567890123456",
  "default_secret_key_change_in_production",
  "change_me_in_production",
];

const envSchema = z
  .object({
    PORT: z.coerce.number().default(5000),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    MONGODB_URI: z
      .string({
        required_error: "MONGODB_URI environment variable is required",
      })
      .min(1, "MONGODB_URI cannot be empty"),
    CLIENT_URL: z.string().default("http://localhost:5173"),
    JWT_ACCESS_SECRET: z
      .string()
      .min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
    JWT_REFRESH_SECRET: z
      .string()
      .min(16, "JWT_REFRESH_SECRET must be at least 16 characters"),
    JWT_ISSUER: z.string().default("lifeos-api"),
    JWT_AUDIENCE: z.string().default("lifeos-app"),
    ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
    COOKIE_NAME: z.string().default("lifeos_refresh_token"),
    REDIS_URL: z.string().default("redis://localhost:6379"),
  })
  .refine(
    (data) => {
      if (data.NODE_ENV === "production") {
        if (
          WEAK_SECRETS.includes(data.JWT_ACCESS_SECRET.toLowerCase()) ||
          WEAK_SECRETS.includes(data.JWT_REFRESH_SECRET.toLowerCase())
        ) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Weak or default JWT secrets are not allowed in production environment",
      path: ["JWT_ACCESS_SECRET"],
    }
  );

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(_env.error.format(), null, 2));
  process.exit(1);
}

export const env = _env.data;
