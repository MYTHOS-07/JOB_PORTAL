import type { Company as PrismaCompany, CompanyStatus } from "../generated/prisma/client";

export class Company {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly companyName: string,
    public readonly description: string | null,
    public readonly industry: string | null,
    public readonly website: string | null,
    public readonly location: string | null,
    public readonly phone: string | null,
    public readonly logoUrl: string | null,
    public readonly status: CompanyStatus,
  ) {}

  static fromPrisma(record: PrismaCompany): Company {
    return new Company(
      record.id,
      record.userId,
      record.companyName,
      record.description,
      record.industry,
      record.website,
      record.location,
      record.phone,
      record.logoUrl,
      record.status,
    );
  }
}
