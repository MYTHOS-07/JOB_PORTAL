import type { UserProfile as PrismaUserProfile } from "../generated/prisma/client";

export class UserProfile {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly phone: string | null,
    public readonly location: string | null,
    public readonly resumeUrl: string | null,
    public readonly bio: string | null,
  ) {}

  static fromPrisma(record: PrismaUserProfile): UserProfile {
    return new UserProfile(
      record.id,
      record.userId,
      record.phone,
      record.location,
      record.resumeUrl,
      record.bio,
    );
  }
}
