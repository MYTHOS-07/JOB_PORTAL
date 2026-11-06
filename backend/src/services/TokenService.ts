import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { redis } from "../config/redis";
import { createRandomToken } from "../utils/crypto";
import type { Role } from "../generated/prisma/client";

export interface AccessTokenPayload {
  sub: number;
  email: string;
  role: Role;
  tokenVersion: number;
  jti: string;
}

/**
 * Creates JWTs and stores revoked token identifiers in Redis.
 */
export class TokenService {
  private blacklistKey(jti: string): string {
    return `blacklist:token:${jti}`;
  }

  /**
   * Signs a short-lived access token with a unique jti.
   */
  signAccessToken(payload: Omit<AccessTokenPayload, "jti">): { token: string; jti: string } {
    const jti = createRandomToken(16);
    const token = jwt.sign({ ...payload, jti }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
    return { token, jti };
  }

  /**
   * Verifies signature and expiry. Does not check the Redis blacklist.
   */
  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as unknown as AccessTokenPayload;
  }

  /**
   * Adds a jti to Redis until the original token would have expired.
   */
  async blacklistToken(token: string): Promise<void> {
    const decoded = jwt.decode(token) as (AccessTokenPayload & { exp?: number }) | null;
    if (!decoded?.jti) {
      return;
    }

    const remainingSeconds = decoded.exp
      ? Math.max(1, decoded.exp - Math.floor(Date.now() / 1000))
      : 15 * 60;

    await redis.set(this.blacklistKey(decoded.jti), "revoked", "EX", remainingSeconds);
  }

  /**
   * Returns true when the token's jti has been revoked.
   */
  async isBlacklisted(jti: string): Promise<boolean> {
    const value = await redis.get(this.blacklistKey(jti));
    return value === "revoked";
  }
}
