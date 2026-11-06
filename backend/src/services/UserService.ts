import { LOG_MARK } from "../constants/log-marks";
import { MESSAGES } from "../constants/messages";
import { UserDao } from "../dao/UserDao";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { logInfo } from "../utils/requestLog";
import { comparePassword } from "../utils/crypto";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { NotificationService } from "./NotificationService";

/**
 * Own-profile updates, public user views, and admin user listing.
 */
export class UserService {
  constructor(
    private readonly userDao: UserDao,
    private readonly notificationService: NotificationService,
  ) {}

  async getMe(userId: number) {
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

  async updateMe(
    userId: number,
    data: { name?: string; phone?: string; location?: string; bio?: string },
  ) {
    if (data.name) {
      await this.userDao.updateUser(userId, { name: data.name });
    }

    await this.userDao.upsertProfile(userId, {
      phone: data.phone,
      location: data.location,
      bio: data.bio,
    });

    logInfo(
      { mark: LOG_MARK.USER_UPDATE, actorUserId: userId, module: "users" },
      "Profile updated",
    );
    return this.getMe(userId);
  }

  async updateAvatar(userId: number, avatarUrl: string) {
    await this.userDao.updateUser(userId, { avatarUrl });
    logInfo(
      { mark: LOG_MARK.USER_AVATAR, actorUserId: userId, module: "users" },
      "Avatar updated",
    );
    return this.getMe(userId);
  }

  async updateResume(userId: number, resumeUrl: string) {
    const user = await this.userDao.findById(userId);
    if (!user || user.role !== "JOB_SEEKER") {
      throw ApiError.forbidden("Only job seekers can upload a resume.");
    }
    await this.userDao.upsertProfile(userId, { resumeUrl });
    logInfo(
      { mark: LOG_MARK.USER_RESUME, actorUserId: userId, module: "users" },
      "Resume uploaded",
    );
    return this.getMe(userId);
  }

  /**
   * Soft-deletes the account after confirming the current password.
   */
  async deleteMe(userId: number, password: string): Promise<void> {
    const user = await this.userDao.findById(userId);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
    }

    const matches = await comparePassword(password, user.password);
    if (!matches) {
      throw ApiError.unauthorized("Password confirmation failed.");
    }

    await this.userDao.updateUser(userId, {
      status: "DELETED",
      email: `deleted-${user.id}-${Date.now()}@deleted.local`,
      name: "Deleted User",
      tokenVersion: { increment: 1 },
    });
    logInfo(
      { mark: LOG_MARK.USER_DELETE, actorUserId: userId, actorEmail: user.email, module: "users" },
      "Account deleted",
    );
  }

  async getPublicUser(id: number) {
    const user = await this.userDao.findByIdWithRelations(id);
    if (!user || user.status === "DELETED") {
      throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
    }

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      profile: user.profile
        ? { location: user.profile.location, bio: user.profile.bio }
        : null,
      company: user.company
        ? { id: user.company.id, companyName: user.company.companyName }
        : null,
    };
  }

  async listUsers(query: {
    page: number;
    limit: number;
    role?: "JOB_SEEKER" | "EMPLOYER" | "ADMIN";
    status?: "ACTIVE" | "SUSPENDED" | "DELETED";
    search?: string;
  }) {
    const { skip, take } = getPagination(query.page, query.limit);
    const { items, totalItems } = await this.userDao.listUsers({
      skip,
      take,
      role: query.role,
      status: query.status,
      search: query.search,
    });

    return {
      items: items.map((user) => ({
        ...User.fromPrisma(user).toPublic(),
        profile: user.profile,
        company: user.company,
      })),
      pagination: buildPaginationMeta(query.page, query.limit, totalItems),
    };
  }

  async updateRole(actorId: number, id: number, role: "JOB_SEEKER" | "EMPLOYER" | "ADMIN") {
    if (actorId === id) {
      throw ApiError.forbidden("You cannot change your own role.");
    }

    const user = await this.userDao.findById(id);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
    }

    const updated = await this.userDao.updateUser(id, {
      role,
      tokenVersion: { increment: 1 },
    });

    if (role === "JOB_SEEKER") {
      await this.userDao.upsertProfile(id, {});
    }

    logInfo(
      {
        mark: LOG_MARK.USER_ROLE,
        actorUserId: actorId,
        targetUserId: id,
        module: "admin",
        fromRole: user.role,
        toRole: role,
      },
      "User role updated",
    );
    await this.notificationService.notify(
      id,
      "Account role updated",
      `Your Elevate Workforce role is now ${role.replace("_", " ").toLowerCase()}.`,
      "ROLE_CHANGED",
    );
    return User.fromPrisma(updated).toPublic();
  }

  async updateStatus(id: number, status: "ACTIVE" | "SUSPENDED") {
    const user = await this.userDao.findById(id);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
    }
    const updated = await this.userDao.updateUser(id, {
      status,
      tokenVersion: status === "SUSPENDED" ? { increment: 1 } : undefined,
    });
    logInfo(
      {
        mark: LOG_MARK.USER_STATUS,
        targetUserId: id,
        module: "admin",
        fromStatus: user.status,
        toStatus: status,
      },
      "User status updated",
    );
    await this.notificationService.notify(
      id,
      "Account status updated",
      status === "SUSPENDED"
        ? "Your account has been suspended. Contact support if this is unexpected."
        : "Your account is active again.",
      "ACCOUNT_STATUS",
    );
    return User.fromPrisma(updated).toPublic();
  }

  async adminDeleteUser(id: number) {
    const user = await this.userDao.findById(id);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
    }
    await this.userDao.updateUser(id, {
      status: "DELETED",
      tokenVersion: { increment: 1 },
    });
    logInfo(
      { mark: LOG_MARK.USER_ADMIN_DELETE, targetUserId: id, module: "admin" },
      "User deactivated by admin",
    );
  }
}
