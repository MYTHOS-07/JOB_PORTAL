import type { EmploymentType, ExperienceLevel, JobStatus, Role } from "../generated/prisma/client";
import { env } from "../config/env";
import { redis } from "../config/redis";
import { LOG_MARK } from "../constants/log-marks";
import { MESSAGES } from "../constants/messages";
import { logInfo } from "../utils/requestLog";
import { JobDao } from "../dao/JobDao";
import { CategoryDao } from "../dao/CategoryDao";
import { ApplicationDao } from "../dao/ApplicationDao";
import { ApiError } from "../utils/ApiError";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { CompanyService } from "./CompanyService";
import { NotificationService } from "./NotificationService";

/**
 * Job CRUD, search, pagination, caching, and ownership checks.
 */
export class JobService {
  constructor(
    private readonly jobDao: JobDao,
    private readonly categoryDao: CategoryDao,
    private readonly applicationDao: ApplicationDao,
    private readonly companyService: CompanyService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(userId: number, data: {
    title: string;
    description: string;
    location: string;
    employmentType: EmploymentType;
    categoryId: number;
    experienceLevel?: ExperienceLevel;
    salaryMin?: number;
    salaryMax?: number;
    applicationDeadline?: string;
    status?: JobStatus;
  }) {
    const company = await this.companyService.requireOwnedCompany(userId);
    const category = await this.categoryDao.findById(data.categoryId);
    if (!category) {
      throw ApiError.badRequest(MESSAGES.CATEGORY.NOT_FOUND);
    }

    const job = await this.jobDao.create({
      companyId: company.id,
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      location: data.location,
      employmentType: data.employmentType,
      experienceLevel: data.experienceLevel ?? "ENTRY_LEVEL",
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
      status: data.status ?? "DRAFT",
    });

    await this.clearJobCache();
    logInfo(
      {
        mark: LOG_MARK.JOB_CREATE,
        actorUserId: userId,
        targetJobId: job.id,
        module: "jobs",
      },
      "Job created",
    );
    return job;
  }

  async getById(id: number, viewer?: { id: number; role: Role }) {
    const job = await this.jobDao.findById(id);
    if (!job) {
      throw ApiError.notFound(MESSAGES.JOB.NOT_FOUND);
    }

    const isOwner = viewer && job.company.userId === viewer.id;
    const isAdmin = viewer?.role === "ADMIN";
    if (job.status !== "PUBLISHED" && !isOwner && !isAdmin) {
      throw ApiError.notFound(MESSAGES.JOB.NOT_FOUND);
    }

    return job;
  }

  async listPublic(query: {
    page: number;
    limit: number;
    search?: string;
    location?: string;
    category?: string;
    categoryId?: number;
    employmentType?: EmploymentType;
    experienceLevel?: ExperienceLevel;
    salaryMin?: number;
    salaryMax?: number;
    sortBy?: "createdAt" | "title" | "salaryMin";
    sortOrder?: "asc" | "desc";
  }) {
    const cacheKey = `cache:jobs:${JSON.stringify(query)}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as Awaited<ReturnType<JobService["queryJobs"]>>;
    }

    const result = await this.queryJobs({ ...query, status: "PUBLISHED" });
    await redis.set(cacheKey, JSON.stringify(result), "EX", env.JOB_LIST_CACHE_TTL_SECONDS);
    return result;
  }

  async listAllForAdmin(
    page: number,
    limit: number,
    filters: { search?: string; status?: JobStatus; location?: string } = {},
  ) {
    return this.queryJobs({ page, limit, ...filters });
  }

  async listMine(
    userId: number,
    page: number,
    limit: number,
    filters: { status?: JobStatus; search?: string; location?: string } = {},
  ) {
    const company = await this.companyService.requireOwnedCompany(userId);
    return this.queryJobs({ page, limit, companyId: company.id, ...filters });
  }

  async update(userId: number, role: Role, jobId: number, data: Record<string, unknown>) {
    const job = await this.requireOwnerOrAdmin(userId, role, jobId);
    const updated = await this.jobDao.update(job.id, {
      ...data,
      applicationDeadline: data.applicationDeadline
        ? new Date(String(data.applicationDeadline))
        : undefined,
    });
    await this.clearJobCache();
    logInfo(
      {
        mark: LOG_MARK.JOB_UPDATE,
        actorUserId: userId,
        actorRole: role,
        targetJobId: job.id,
        module: "jobs",
      },
      "Job updated",
    );
    return updated;
  }

  async changeStatus(userId: number, role: Role, jobId: number, status: JobStatus) {
    const job = await this.requireOwnerOrAdmin(userId, role, jobId);
    const updated = await this.jobDao.update(job.id, { status });
    await this.clearJobCache();
    logInfo(
      {
        mark: LOG_MARK.JOB_STATUS,
        actorUserId: userId,
        actorRole: role,
        targetJobId: job.id,
        module: "jobs",
        toStatus: status,
      },
      "Job status changed",
    );
    if (status === "PUBLISHED") {
      await this.notificationService.notify(
        job.company.userId,
        "Job published",
        `${job.title} is now live on Elevate Workforce.`,
        "JOB_PUBLISHED",
      );
    }
    return updated;
  }

  async delete(userId: number, role: Role, jobId: number) {
    const job = await this.requireOwnerOrAdmin(userId, role, jobId);
    await this.jobDao.delete(job.id);
    await this.clearJobCache();
    logInfo(
      {
        mark: LOG_MARK.JOB_DELETE,
        actorUserId: userId,
        actorRole: role,
        targetJobId: job.id,
        module: "jobs",
      },
      "Job deleted",
    );
  }

  async statistics(userId: number, role: Role, jobId: number) {
    const job = await this.requireOwnerOrAdmin(userId, role, jobId);
    const totalApplications = await this.applicationDao.countForJob(job.id);
    return {
      jobId: job.id,
      title: job.title,
      status: job.status,
      totalApplications,
    };
  }

  private async queryJobs(query: {
    page: number;
    limit: number;
    search?: string;
    location?: string;
    category?: string;
    categoryId?: number;
    employmentType?: EmploymentType;
    experienceLevel?: ExperienceLevel;
    salaryMin?: number;
    salaryMax?: number;
    sortBy?: "createdAt" | "title" | "salaryMin";
    sortOrder?: "asc" | "desc";
    status?: JobStatus;
    companyId?: number;
  }) {
    const { skip, take } = getPagination(query.page, query.limit);
    const { items, totalItems } = await this.jobDao.list({
      skip,
      take,
      search: query.search,
      location: query.location,
      category: query.category,
      categoryId: query.categoryId,
      employmentType: query.employmentType,
      experienceLevel: query.experienceLevel,
      salaryMin: query.salaryMin,
      salaryMax: query.salaryMax,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      status: query.status,
      companyId: query.companyId,
    });

    return {
      items,
      pagination: buildPaginationMeta(query.page, query.limit, totalItems),
    };
  }

  private async requireOwnerOrAdmin(userId: number, role: Role, jobId: number) {
    const job = await this.jobDao.findById(jobId);
    if (!job) {
      throw ApiError.notFound(MESSAGES.JOB.NOT_FOUND);
    }
    if (role !== "ADMIN" && job.company.userId !== userId) {
      throw ApiError.forbidden(MESSAGES.AUTH.FORBIDDEN);
    }
    return job;
  }

  private async clearJobCache(): Promise<void> {
    const keys = await redis.keys("cache:jobs:*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
