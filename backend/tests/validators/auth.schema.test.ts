import { describe, expect, it } from "vitest";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../../src/validators/auth.schema";

describe("registerSchema", () => {
  it("accepts a valid job seeker", () => {
    const parsed = registerSchema.safeParse({
      body: {
        name: "Anisha Rai",
        email: "anisha@example.com",
        password: "Password@123",
        role: "JOB_SEEKER",
      },
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects admin self-registration and weak passwords", () => {
    expect(
      registerSchema.safeParse({
        body: { name: "A", email: "bad", password: "short", role: "ADMIN" },
      }).success,
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires an email and a password", () => {
    expect(loginSchema.safeParse({ body: { email: "seeker@elevateworkforce.local", password: "x" } }).success).toBe(true);
    expect(loginSchema.safeParse({ body: { email: "not-an-email", password: "" } }).success).toBe(false);
  });
});

describe("password confirmation schemas", () => {
  it("rejects mismatched reset passwords", () => {
    const parsed = resetPasswordSchema.safeParse({
      body: { token: "abcdefghijklmnop", newPassword: "Password@123", confirmPassword: "Other@1234" },
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects mismatched change-password values", () => {
    const parsed = changePasswordSchema.safeParse({
      body: { currentPassword: "Password@123", newPassword: "Password@124", confirmPassword: "nope" },
    });
    expect(parsed.success).toBe(false);
  });
});
