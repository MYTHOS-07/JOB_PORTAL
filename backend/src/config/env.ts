import "dotenv/config";
import { z } from "zod";

/**
 * Loads and validates every setting the API needs from process.env.
 * Change behaviour by editing backend/.env — no code changes required.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  APP_NAME: z.string().default("Elevate Workforce"),
  FRONTEND_URL: z.string().default("http://localhost:3001"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_COOKIE_NAME: z.string().default("access_token"),
  COOKIE_SECURE: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  CSRF_ENABLED: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
  CSRF_COOKIE_NAME: z.string().default("csrf_token"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
  LOGIN_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().default(5),
  PASSWORD_RESET_RATE_LIMIT_MAX: z.coerce.number().default(5),
  API_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  API_RATE_LIMIT_MAX: z.coerce.number().default(100),
  JOB_LIST_CACHE_TTL_SECONDS: z.coerce.number().default(60),
  UPLOAD_DIR: z.string().default("uploads"),
  MAX_RESUME_SIZE_MB: z.coerce.number().default(5),
  MAX_IMAGE_SIZE_MB: z.coerce.number().default(2),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
  CLOUDINARY_FOLDER: z.string().optional().default("elevate-workforce"),
  SEQ_URL: z.string().default("http://localhost:5341"),
  SEQ_API_KEY: z.string().optional().default(""),
  SMTP_HOST: z.string().default("127.0.0.1"),
  SMTP_PORT: z.coerce.number().default(2525),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  SMTP_FROM: z.string().default("Elevate Workforce <noreply@elevateworkforce.local>"),
  PASSWORD_RESET_TTL_SECONDS: z.coerce.number().default(900),
});

export type AppEnv = z.infer<typeof envSchema>;

/**
 * Parses environment variables once at startup.
 *
 * @throws {Error} when required variables are missing or invalid
 */
export function loadEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return parsed.data;
}

export const env = loadEnv();
