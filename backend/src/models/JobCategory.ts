import type { JobCategory as PrismaJobCategory } from "../generated/prisma/client";

export class JobCategory {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly slug: string,
  ) {}

  static fromPrisma(record: PrismaJobCategory): JobCategory {
    return new JobCategory(record.id, record.name, record.slug);
  }
}
