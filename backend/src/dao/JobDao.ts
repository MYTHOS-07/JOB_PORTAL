import type { EmploymentType, ExperienceLevel, Job, JobStatus, Prisma } from "../generated/prisma/client";
import { prisma } from "../config/database";

export interface JobListFilters {
  skip: number;
  take: number;
  search?: string;
  location?: string;
  categoryId?: number;
  category?: string;
  employmentType?: EmploymentType;
  experienceLevel?: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  status?: JobStatus;
  companyId?: number;
  sortBy?: "createdAt" | "title" | "salaryMin";
  sortOrder?: "asc" | "desc";
}

/**
 * Data access for job advertisements.
 */
export class JobDao {
  async findById(id: number) {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        category: true,
        _count: { select: { applications: true } },
      },
    });
    if (!job) {
      return null;
    }
    return {
      ...job,
      salaryMin: job.salaryMin === null ? null : Number(job.salaryMin),
      salaryMax: job.salaryMax === null ? null : Number(job.salaryMax),
    };
  }

  async create(data: Prisma.JobUncheckedCreateInput): Promise<Job> {
    return prisma.job.create({ data });
  }

  async update(id: number, data: Prisma.JobUpdateInput): Promise<Job> {
    return prisma.job.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Job> {
    return prisma.job.delete({ where: { id } });
  }

  /**
   * Paginated job search with optional filters.
   */
  async list(filters: JobListFilters) {
    const where: Prisma.JobWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.companyId ? { companyId: filters.companyId } : {}),
      ...(filters.location
        ? { location: { contains: filters.location, mode: "insensitive" } }
        : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.category
        ? { category: { name: { contains: filters.category, mode: "insensitive" } } }
        : {}),
      ...(filters.employmentType ? { employmentType: filters.employmentType } : {}),
      ...(filters.experienceLevel ? { experienceLevel: filters.experienceLevel } : {}),
      ...(filters.salaryMin !== undefined ? { salaryMax: { gte: filters.salaryMin } } : {}),
      ...(filters.salaryMax !== undefined ? { salaryMin: { lte: filters.salaryMax } } : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" } },
              { description: { contains: filters.search, mode: "insensitive" } },
              { location: { contains: filters.search, mode: "insensitive" } },
              { company: { companyName: { contains: filters.search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const sortBy = filters.sortBy ?? "createdAt";
    const sortOrder = filters.sortOrder ?? "desc";

    const [items, totalItems] = await prisma.$transaction([
      prisma.job.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          company: { select: { id: true, companyName: true, location: true, logoUrl: true } },
          category: true,
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return {
      items: items.map((job) => ({
        ...job,
        salaryMin: job.salaryMin === null ? null : Number(job.salaryMin),
        salaryMax: job.salaryMax === null ? null : Number(job.salaryMax),
      })),
      totalItems,
    };
  }

  async countByStatus(status: JobStatus): Promise<number> {
    return prisma.job.count({ where: { status } });
  }

  async countAll(): Promise<number> {
    return prisma.job.count();
  }

  async countByCompany(companyId: number): Promise<number> {
    return prisma.job.count({ where: { companyId } });
  }
}
