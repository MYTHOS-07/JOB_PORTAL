import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/config/database", () => ({ prisma: {} }));
vi.mock("../../src/config/redis", () => ({
  redis: { keys: vi.fn().mockResolvedValue([]), del: vi.fn(), get: vi.fn(), set: vi.fn() },
}));
vi.mock("../../src/config/email", () => ({ mailTransport: { sendMail: vi.fn() } }));
vi.mock("../../src/utils/requestLog", () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));
vi.mock("../../src/utils/crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/utils/crypto")>();
  return {
    ...actual,
    hashPassword: vi.fn().mockResolvedValue("hashed-password"),
    comparePassword: vi.fn(),
  };
});

import { AuthService } from "../../src/services/AuthService";
import { MESSAGES } from "../../src/constants/messages";

function createService() {
  const userDao = {
    findByEmail: vi.fn(),
    createUser: vi.fn(),
    findById: vi.fn(),
    findByIdWithRelations: vi.fn(),
    updateUser: vi.fn(),
    incrementTokenVersion: vi.fn(),
  };
  const tokenService = { signAccessToken: vi.fn(), blacklistToken: vi.fn(), isBlacklisted: vi.fn() };
  const passwordResetService = { createResetToken: vi.fn() };
  const emailService = { sendWelcomeEmail: vi.fn(), sendPasswordResetEmail: vi.fn(), sendPasswordChangedEmail: vi.fn() };
  const notificationService = { notify: vi.fn() };

  const service = new AuthService(
    userDao as never,
    tokenService as never,
    passwordResetService as never,
    emailService as never,
    notificationService as never,
  );

  return { service, userDao, emailService };
}

describe("AuthService.register", () => {
  let ctx: ReturnType<typeof createService>;

  beforeEach(() => {
    ctx = createService();
  });

  it("creates a job seeker and hides the password hash", async () => {
    ctx.userDao.findByEmail.mockResolvedValue(null);
    ctx.userDao.createUser.mockResolvedValue({
      id: 40,
      name: "Test Seeker",
      email: "tester@elevateworkforce.local",
      password: "hashed-password",
      role: "JOB_SEEKER",
      status: "ACTIVE",
      tokenVersion: 0,
      avatarUrl: null,
      createdAt: new Date("2026-11-06"),
      updatedAt: new Date("2026-11-06"),
    });

    const publicUser = await ctx.service.register({
      name: "Test Seeker",
      email: "tester@elevateworkforce.local",
      password: "Password@123",
      role: "JOB_SEEKER",
    });

    expect(publicUser.role).toBe("JOB_SEEKER");
    expect(publicUser).not.toHaveProperty("password");
    expect(ctx.emailService.sendWelcomeEmail).toHaveBeenCalled();
  });

  it("rejects public administrator registration", async () => {
    await expect(
      ctx.service.register({
        name: "Fake Admin",
        email: "admin@example.com",
        password: "Password@123",
        role: "ADMIN",
      }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("rejects a duplicate email", async () => {
    ctx.userDao.findByEmail.mockResolvedValue({ id: 1, email: "seeker@elevateworkforce.local" });
    await expect(
      ctx.service.register({
        name: "Duplicate",
        email: "seeker@elevateworkforce.local",
        password: "Password@123",
        role: "JOB_SEEKER",
      }),
    ).rejects.toMatchObject({ statusCode: 409, message: "An account with this email already exists." });
  });
});

describe("AuthService.login", () => {
  it("rejects unknown credentials without revealing which field was wrong", async () => {
    const { service, userDao } = createService();
    userDao.findByEmail.mockResolvedValue(null);
    const res = { cookie: vi.fn() };

    await expect(service.login("missing@example.com", "Password@123", res as never)).rejects.toMatchObject({
      statusCode: 401,
      message: MESSAGES.AUTH.INVALID_CREDENTIALS,
    });
  });
});
