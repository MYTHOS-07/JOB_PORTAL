import type { JobCategory, Prisma } from "../generated/prisma/client";
import { prisma } from "../config/database";

/**
 * Data access for job categories.
 */
export class CategoryDao {
  async findById(id: number): Promise<JobCategory | null> {
    return prisma.jobCategory.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<JobCategory | null> {
    return prisma.jobCategory.findUnique({ where: { slug } });
  }

  async list(): Promise<JobCategory[]> {
    return prisma.jobCategory.findMany({ orderBy: { name: "asc" } });
  }

  async create(data: Prisma.JobCategoryCreateInput): Promise<JobCategory> {
    return prisma.jobCategory.create({ data });
  }

  async update(id: number, data: Prisma.JobCategoryUpdateInput): Promise<JobCategory> {
    return prisma.jobCategory.update({ where: { id }, data });
  }

  async delete(id: number): Promise<JobCategory> {
    return prisma.jobCategory.delete({ where: { id } });
  }
}
