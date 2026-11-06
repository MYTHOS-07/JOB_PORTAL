import type { EmploymentType, ExperienceLevel, Job as PrismaJob, JobStatus } from "../generated/prisma/client";

export class Job {
  constructor(
    public readonly id: number,
    public readonly companyId: number,
    public readonly categoryId: number,
    public readonly title: string,
    public readonly description: string,
    public readonly location: string,
    public readonly employmentType: EmploymentType,
    public readonly experienceLevel: ExperienceLevel,
    public readonly salaryMin: number | null,
    public readonly salaryMax: number | null,
    public readonly status: JobStatus,
    public readonly applicationDeadline: Date | null,
  ) {}

  static fromPrisma(record: PrismaJob): Job {
    return new Job(
      record.id,
      record.companyId,
      record.categoryId,
      record.title,
      record.description,
      record.location,
      record.employmentType,
      record.experienceLevel,
      record.salaryMin === null ? null : Number(record.salaryMin),
      record.salaryMax === null ? null : Number(record.salaryMax),
      record.status,
      record.applicationDeadline,
    );
  }
}
