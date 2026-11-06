import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { env } from "../config/env";
import { redis } from "../config/redis";

function createStore(prefix: string) {
  return new RedisStore({
    prefix,
    sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)) as Promise<string>,
  });
}

/**
 * General API limiter.
 */
export const apiRateLimiter = rateLimit({
  windowMs: env.API_RATE_LIMIT_WINDOW_MS,
  limit: env.API_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore("rl:api:"),
});

/**
 * Stricter limiter for login attempts.
 */
export const loginRateLimiter = rateLimit({
  windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
  limit: env.LOGIN_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore("rl:login:"),
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

/**
 * Stricter limiter for forgot-password requests.
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
  limit: env.PASSWORD_RESET_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore("rl:reset:"),
  message: {
    success: false,
    message: "Too many password reset requests. Please try again later.",
  },
});
