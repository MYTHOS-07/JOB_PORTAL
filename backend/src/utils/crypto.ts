import { createHash, randomBytes, timingSafeEqual } from "crypto";
import bcrypt from "bcrypt";
import { env } from "../config/env";

/**
 * Hashes a plain password with bcrypt.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, env.BCRYPT_SALT_ROUNDS);
}

/**
 * Compares a plain password with a stored bcrypt hash.
 */
export async function comparePassword(
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Creates a cryptographically random token for password-reset emails.
 */
export function createRandomToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

/**
 * SHA-256 hashes a token before storing it in Redis.
 */
export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Constant-time string comparison to reduce timing leaks.
 */
export function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}
