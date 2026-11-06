import type { Application, ApplicationStatus, Prisma } from "../generated/prisma/client";
import { prisma } from "../config/database";

/**
 * Data access for job applications.
 */
export class ApplicationDao {
  async findById(id: number) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        job: { include: { company: true } },
        applicant: { include: { profile: true } },
      },
    });
  }

  async findByJobAndApplicant(jobId: number, applicantId: number) {
    return prisma.application.findUnique({
      where: { jobId_applicantId: { jobId, applicantId } },
    });
  }

  async create(data: Prisma.ApplicationUncheckedCreateInput): Promise<Application> {
    return prisma.application.create({ data });
  }

  async update(id: number, data: Prisma.ApplicationUpdateInput): Promise<Application> {
    return prisma.application.update({ where: { id }, data });
  }

  private searchWhere(search?: string): Prisma.ApplicationWhereInput {
    if (!search) return {};
    return {
      OR: [
        { job: { title: { contains: search, mode: "insensitive" } } },
        { job: { company: { companyName: { contains: search, mode: "insensitive" } } } },
        { applicant: { name: { contains: search, mode: "insensitive" } } },
        { applicant: { email: { contains: search, mode: "insensitive" } } },
      ],
    };
  }

  async listForApplicant(
    applicantId: number,
    skip: number,
    take: number,
    filters: { search?: string; status?: ApplicationStatus } = {},
  ) {
    const where: Prisma.ApplicationWhereInput = {
      applicantId,
      ...(filters.status ? { status: filters.status } : {}),
      ...this.searchWhere(filters.search),
    };
    const [items, totalItems] = await prisma.$transaction([
      prisma.application.findMany({
        where,
        skip,
        take,
        orderBy: { appliedAt: "desc" },
        include: {
          job: {
            include: {
              company: { select: { id: true, companyName: true, logoUrl: true } },
            },
          },
        },
      }),
      prisma.application.count({ where }),
    ]);
    return { items, totalItems };
  }

  async listForCompany(
    companyId: number,
    skip: number,
    take: number,
    filters: { jobId?: number; search?: string; status?: ApplicationStatus } = {},
  ) {
    const where: Prisma.ApplicationWhereInput = {
      job: { companyId, ...(filters.jobId ? { id: filters.jobId } : {}) },
      ...(filters.status ? { status: filters.status } : {}),
      ...this.searchWhere(filters.search),
    };
    const [items, totalItems] = await prisma.$transaction([
      prisma.application.findMany({
        where,
        skip,
        take,
        orderBy: { appliedAt: "desc" },
        include: {
          job: { select: { id: true, title: true } },
          applicant: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              profile: true,
            },
          },
        },
      }),
      prisma.application.count({ where }),
    ]);
    return { items, totalItems };
  }

  async listAll(
    skip: number,
    take: number,
    filters: { search?: string; status?: ApplicationStatus; jobId?: number } = {},
  ) {
    const where: Prisma.ApplicationWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.jobId ? { jobId: filters.jobId } : {}),
      ...this.searchWhere(filters.search),
    };
    const [items, totalItems] = await prisma.$transaction([
      prisma.application.findMany({
        where,
        skip,
        take,
        orderBy: { appliedAt: "desc" },
        include: {
          job: { select: { id: true, title: true } },
          applicant: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.application.count({ where }),
    ]);
    return { items, totalItems };
  }

  async countByApplicantAndStatus(applicantId: number, status?: ApplicationStatus) {
    return prisma.application.count({
      where: { applicantId, ...(status ? { status } : {}) },
    });
  }

  async countByCompany(companyId: number, status?: ApplicationStatus) {
    return prisma.application.count({
      where: { job: { companyId }, ...(status ? { status } : {}) },
    });
  }

  async countForJob(jobId: number): Promise<number> {
    return prisma.application.count({ where: { jobId } });
  }

  async countAll(): Promise<number> {
    return prisma.application.count();
  }
}
