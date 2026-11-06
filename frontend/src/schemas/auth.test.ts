import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema, resetPasswordSchema } from "./auth";

describe("frontend loginSchema", () => {
  it("accepts a valid email and password", () => {
    expect(loginSchema.safeParse({ email: "seeker@elevateworkforce.local", password: "Password@123" }).success).toBe(
      true,
    );
  });

  it("shows a clear message for an invalid email", () => {
    const parsed = loginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe("Enter a valid email");
    }
  });
});

describe("frontend registerSchema", () => {
  it("allows seeker or employer but not admin", () => {
    expect(
      registerSchema.safeParse({
        name: "Sita Maharjan",
        email: "employer@elevateworkforce.local",
        password: "Password@123",
        role: "EMPLOYER",
      }).success,
    ).toBe(true);
    expect(
      registerSchema.safeParse({
        name: "Platform Admin",
        email: "admin@elevateworkforce.local",
        password: "Password@123",
        role: "ADMIN",
      }).success,
    ).toBe(false);
  });
});

describe("frontend resetPasswordSchema", () => {
  it("requires matching passwords", () => {
    const parsed = resetPasswordSchema.safeParse({
      token: "abcdefghijklmnop",
      newPassword: "Password@123",
      confirmPassword: "Password@124",
    });
    expect(parsed.success).toBe(false);
  });
});
