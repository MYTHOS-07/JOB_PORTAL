import type { Role, User as PrismaUser, UserStatus } from "../generated/prisma/client";

/**
 * Domain representation of a user. The password hash is never exposed
 * through {@link User.toPublic}.
 */
export class User {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly email: string,
    public readonly role: Role,
    public readonly status: UserStatus,
    public readonly tokenVersion: number,
    public readonly avatarUrl: string | null,
    public readonly createdAt: Date,
  ) {}

  /**
   * Builds a User from a Prisma row.
   */
  static fromPrisma(record: PrismaUser): User {
    return new User(
      record.id,
      record.name,
      record.email,
      record.role,
      record.status,
      record.tokenVersion,
      record.avatarUrl,
      record.createdAt,
    );
  }

  /**
   * Safe JSON for API responses.
   */
  toPublic() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      status: this.status,
      avatarUrl: this.avatarUrl,
      createdAt: this.createdAt,
    };
  }
}
