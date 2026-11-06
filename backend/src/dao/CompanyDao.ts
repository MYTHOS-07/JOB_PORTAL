import type { Company, CompanyStatus, Prisma } from "../generated/prisma/client";
import { prisma } from "../config/database";

/**
 * Data access for company profiles.
 */
export class CompanyDao {
  async findById(id: number) {
    return prisma.company.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async findByUserId(userId: number): Promise<Company | null> {
    return prisma.company.findUnique({ where: { userId } });
  }

  async create(data: Prisma.CompanyUncheckedCreateInput): Promise<Company> {
    return prisma.company.create({ data });
  }

  async update(id: number, data: Prisma.CompanyUpdateInput): Promise<Company> {
    return prisma.company.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Company> {
    return prisma.company.delete({ where: { id } });
  }

  async list(params: {
    skip: number;
    take: number;
    search?: string;
    status?: CompanyStatus;
    location?: string;
    industry?: string;
  }) {
    const where: Prisma.CompanyWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.location
        ? { location: { contains: params.location, mode: "insensitive" } }
        : {}),
      ...(params.industry
        ? { industry: { contains: params.industry, mode: "insensitive" } }
        : {}),
      ...(params.search
        ? {
            OR: [
              { companyName: { contains: params.search, mode: "insensitive" } },
              { location: { contains: params.search, mode: "insensitive" } },
              { industry: { contains: params.search, mode: "insensitive" } },
              { description: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, totalItems] = await prisma.$transaction([
      prisma.company.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.company.count({ where }),
    ]);

    return { items, totalItems };
  }

  async countAll(): Promise<number> {
    return prisma.company.count();
  }
}
