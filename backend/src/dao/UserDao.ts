import type { Prisma, Role, User, UserStatus } from "../generated/prisma/client";
import { prisma } from "../config/database";

/**
 * Data access for users and job-seeker profiles.
 */
export class UserDao {
  /**
   * Finds a user by email address.
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  /**
   * Finds a user by primary key.
   */
  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  /**
   * Finds a user together with profile and company.
   */
  async findByIdWithRelations(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: { profile: true, company: true },
    });
  }

  /**
   * Creates a user and, for job seekers, an empty profile in one transaction.
   */
  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: data.password,
        role: data.role,
        profile: data.role === "JOB_SEEKER" ? { create: {} } : undefined,
      },
    });
  }

  /**
   * Updates selected user fields.
   */
  async updateUser(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  /**
   * Increments tokenVersion so older JWTs are rejected.
   */
  async incrementTokenVersion(id: number): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { tokenVersion: { increment: 1 } },
    });
  }

  /**
   * Updates or creates the job-seeker profile.
   */
  async upsertProfile(
    userId: number,
    data: { phone?: string; location?: string; resumeUrl?: string; bio?: string },
  ) {
    return prisma.userProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  /**
   * Lists users for the admin panel.
   */
  async listUsers(params: {
    skip: number;
    take: number;
    role?: Role;
    status?: UserStatus;
    search?: string;
  }) {
    const where: Prisma.UserWhereInput = {
      ...(params.role ? { role: params.role } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { email: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, totalItems] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: { profile: true, company: true },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, totalItems };
  }

  async countByRole(role: Role): Promise<number> {
    return prisma.user.count({ where: { role } });
  }

  async countAll(): Promise<number> {
    return prisma.user.count();
  }
}
