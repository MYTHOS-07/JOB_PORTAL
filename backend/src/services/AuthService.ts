import type { CookieOptions, Response } from "express";
import type { Role } from "../generated/prisma/client";
import { env } from "../config/env";
import { LOG_MARK } from "../constants/log-marks";
import { MESSAGES } from "../constants/messages";
import { logInfo, logWarn } from "../utils/requestLog";
import { PUBLIC_REGISTER_ROLES } from "../constants/roles";
import { UserDao } from "../dao/UserDao";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { comparePassword, createRandomToken, hashPassword } from "../utils/crypto";
import { EmailService } from "./EmailService";
import { NotificationService } from "./NotificationService";
import { PasswordResetService } from "./PasswordResetService";
import { TokenService } from "./TokenService";

/**
 * Registration, login, logout, and password workflows.
 */
export class AuthService {
  constructor(
    private readonly userDao: UserDao,
    private readonly tokenService: TokenService,
    private readonly passwordResetService: PasswordResetService,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Registers a job seeker or employer. Admin self-registration is rejected.
   */
  async register(input: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }) {
    if (!PUBLIC_REGISTER_ROLES.includes(input.role as (typeof PUBLIC_REGISTER_ROLES)[number])) {
      throw ApiError.forbidden("Administrators cannot be created through public registration.");
    }

    const existing = await this.userDao.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict("An account with this email already exists.");
    }

    const passwordHash = await hashPassword(input.password);
    const created = await this.userDao.createUser({
      name: input.name,
      email: input.email,
      password: passwordHash,
      role: input.role,
    });

    await this.emailService.sendWelcomeEmail(created.email, created.name);
    await this.notificationService.notify(
      created.id,
      "Welcome to Elevate Workforce",
      "Your account is ready. Complete your profile to get started.",
      "WELCOME",
    );
    logInfo(
      {
        mark: LOG_MARK.AUTH_REGISTER,
        actorUserId: created.id,
        actorEmail: created.email,
        actorRole: created.role,
        module: "auth",
      },
      "User registered",
    );

    return User.fromPrisma(created).toPublic();
  }

  /**
   * Validates credentials and issues an HttpOnly JWT cookie.
   */
  async login(email: string, password: string, res: Response) {
    const user = await this.userDao.findByEmail(email);
    if (!user) {
      logWarn(
        { mark: LOG_MARK.AUTH_LOGIN_FAIL, problem: "unknown_email", actorEmail: email, module: "auth" },
        "Login failed: unknown email",
      );
      throw ApiError.unauthorized(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    if (user.status !== "ACTIVE") {
      logWarn(
        {
          mark: LOG_MARK.AUTH_LOGIN_FAIL,
          problem: "account_suspended",
          actorUserId: user.id,
          actorEmail: user.email,
          module: "auth",
        },
        "Login failed: account suspended",
      );
      throw ApiError.forbidden(MESSAGES.AUTH.ACCOUNT_SUSPENDED);
    }

    const passwordMatches = await comparePassword(password, user.password);
    if (!passwordMatches) {
      logWarn(
        {
          mark: LOG_MARK.AUTH_LOGIN_FAIL,
          problem: "bad_password",
          actorUserId: user.id,
          actorEmail: user.email,
          module: "auth",
        },
        "Login failed: bad password",
      );
      throw ApiError.unauthorized(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    this.attachAuthCookies(res, {
      id: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    logInfo(
      {
        mark: LOG_MARK.AUTH_LOGIN,
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        module: "auth",
      },
      "User logged in",
    );
    return User.fromPrisma(user).toPublic();
  }

  /**
   * Blacklists the current JWT and clears cookies.
   */
  async logout(token: string | undefined, res: Response): Promise<void> {
    if (token) {
      await this.tokenService.blacklistToken(token);
    }
    this.clearAuthCookies(res);
    logInfo({ mark: LOG_MARK.AUTH_LOGOUT, module: "auth" }, "User logged out");
  }

  /**
   * Increments tokenVersion so every existing JWT for the user is rejected.
   */
  async logoutAll(userId: number, res: Response): Promise<void> {
    await this.userDao.incrementTokenVersion(userId);
    this.clearAuthCookies(res);
    logInfo(
      { mark: LOG_MARK.AUTH_LOGOUT_ALL, actorUserId: userId, module: "auth" },
      "All sessions signed out",
    );
  }

  async getCurrentUser(userId: number) {
    const user = await this.userDao.findByIdWithRelations(userId);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
    }
    return {
      ...User.fromPrisma(user).toPublic(),
      profile: user.profile,
      company: user.company,
    };
  }

  /**
   * Always returns the same message so attackers cannot probe emails.
   */
  async forgotPassword(email: string): Promise<{ resetUrl?: string }> {
    const user = await this.userDao.findByEmail(email);
    if (!user || user.status !== "ACTIVE") {
      return {};
    }

    const rawToken = await this.passwordResetService.createResetToken(user.id);
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;
    await this.emailService.sendPasswordResetEmail(user.email, user.name, rawToken);
    logInfo(
      {
        mark: LOG_MARK.AUTH_FORGOT,
        actorUserId: user.id,
        actorEmail: user.email,
        module: "auth",
      },
      "Password reset email queued",
    );

    if (env.NODE_ENV !== "production") {
      return { resetUrl };
    }

    return {};
  }

  /**
   * Consumes a one-time token, updates the password, and revokes sessions.
   */
  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const userId = await this.passwordResetService.consumeResetToken(rawToken);
    if (!userId) {
      throw ApiError.badRequest(MESSAGES.AUTH.RESET_INVALID);
    }

    const user = await this.userDao.findById(userId);
    if (!user) {
      throw ApiError.badRequest(MESSAGES.AUTH.RESET_INVALID);
    }

    const passwordHash = await hashPassword(newPassword);
    await this.userDao.updateUser(userId, { password: passwordHash });
    await this.userDao.incrementTokenVersion(userId);
    await this.emailService.sendPasswordChangedEmail(user.email, user.name);
    logInfo(
      {
        mark: LOG_MARK.AUTH_RESET,
        actorUserId: userId,
        actorEmail: user.email,
        module: "auth",
      },
      "Password reset completed",
    );
  }

  /**
   * Changes password for an authenticated user and forces a fresh login.
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
    res: Response,
  ): Promise<void> {
    const user = await this.userDao.findById(userId);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
    }

    const matches = await comparePassword(currentPassword, user.password);
    if (!matches) {
      throw ApiError.unauthorized("Current password is incorrect.");
    }

    if (currentPassword === newPassword) {
      throw ApiError.badRequest("The new password must be different from the current password.");
    }

    const passwordHash = await hashPassword(newPassword);
    await this.userDao.updateUser(userId, { password: passwordHash });
    await this.userDao.incrementTokenVersion(userId);
    this.clearAuthCookies(res);
    await this.emailService.sendPasswordChangedEmail(user.email, user.name);
    logInfo(
      {
        mark: LOG_MARK.AUTH_CHANGE,
        actorUserId: userId,
        actorEmail: user.email,
        module: "auth",
      },
      "Password changed",
    );
  }

  /**
   * Issues a readable CSRF cookie for browser clients when CSRF is enabled.
   */
  issueCsrfCookie(res: Response): string {
    const token = createRandomToken(24);
    res.cookie(env.CSRF_COOKIE_NAME, token, {
      ...this.baseCookieOptions(),
      httpOnly: false,
    });
    return token;
  }

  private attachAuthCookies(
    res: Response,
    user: { id: number; email: string; role: Role; tokenVersion: number },
  ): void {
    const { token } = this.tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    res.cookie(env.JWT_COOKIE_NAME, token, {
      ...this.baseCookieOptions(),
      httpOnly: true,
    });

    if (env.CSRF_ENABLED) {
      this.issueCsrfCookie(res);
    }
  }

  private clearAuthCookies(res: Response): void {
    const options = this.baseCookieOptions();
    res.clearCookie(env.JWT_COOKIE_NAME, { ...options, httpOnly: true });
    res.clearCookie(env.CSRF_COOKIE_NAME, { ...options, httpOnly: false });
  }

  private baseCookieOptions(): CookieOptions {
    return {
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      path: "/",
    };
  }
}
