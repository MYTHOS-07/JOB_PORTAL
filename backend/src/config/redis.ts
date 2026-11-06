import Redis from "ioredis";
import { env } from "./env";

/**
 * Shared Redis client used for token blacklisting, password-reset tokens,
 * job-list caching, and rate limiting.
 */
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

/**
 * Confirms Redis is reachable.
 */
export async function checkRedisConnection(): Promise<boolean> {
  try {
    const reply = await redis.ping();
    return reply === "PONG";
  } catch {
    return false;
  }
}
