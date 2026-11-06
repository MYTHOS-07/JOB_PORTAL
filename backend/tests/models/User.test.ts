import { describe, expect, it } from "vitest";
import { User } from "../../src/models/User";

describe("User.toPublic", () => {
  it("never includes the password hash", () => {
    const user = User.fromPrisma({
      id: 3,
      name: "Demo Seeker",
      email: "seeker@elevateworkforce.local",
      password: "$2b$10$not-a-real-hash",
      role: "JOB_SEEKER",
      status: "ACTIVE",
      tokenVersion: 1,
      avatarUrl: null,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });

    const publicUser = user.toPublic();
    expect(publicUser).not.toHaveProperty("password");
    expect(publicUser.email).toBe("seeker@elevateworkforce.local");
    expect(publicUser.role).toBe("JOB_SEEKER");
  });
});
