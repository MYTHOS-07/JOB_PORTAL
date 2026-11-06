import { env } from "../config/env";
import { redis } from "../config/redis";
import { createRandomToken, sha256 } from "../utils/crypto";

/**
 * Stores hashed one-time password-reset tokens in Redis.
 * Raw tokens are never persisted.
 */
export class PasswordResetService {
  private keyForHash(tokenHash: string): string {
    return `password-reset:${tokenHash}`;
  }

  /**
   * Creates a raw token for the email and stores only its SHA-256 hash.
   *
   * @returns the raw token to include in the email link
   */
  async createResetToken(userId: number): Promise<string> {
    const rawToken = createRandomToken(32);
    const tokenHash = sha256(rawToken);
    await redis.set(
      this.keyForHash(tokenHash),
      String(userId),
      "EX",
      env.PASSWORD_RESET_TTL_SECONDS,
    );
    return rawToken;
  }

  /**
   * Atomically reads and deletes the reset token so it can be used only once.
   *
   * @returns the user id, or null if the token is missing or expired
   */
  async consumeResetToken(rawToken: string): Promise<number | null> {
    const tokenHash = sha256(rawToken);
    const userId = await redis.getdel(this.keyForHash(tokenHash));
    if (!userId) {
      return null;
    }
    return Number(userId);
  }
}
