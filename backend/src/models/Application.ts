import type { Application as PrismaApplication, ApplicationStatus } from "../generated/prisma/client";

export class Application {
  constructor(
    public readonly id: number,
    public readonly jobId: number,
    public readonly applicantId: number,
    public readonly coverLetter: string | null,
    public readonly status: ApplicationStatus,
    public readonly appliedAt: Date,
  ) {}

  static fromPrisma(record: PrismaApplication): Application {
    return new Application(
      record.id,
      record.jobId,
      record.applicantId,
      record.coverLetter,
      record.status,
      record.appliedAt,
    );
  }
}
