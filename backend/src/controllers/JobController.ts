import type { Request, Response } from "express";
import type { EmploymentType, ExperienceLevel, JobStatus } from "../generated/prisma/client";
import { HTTP_STATUS } from "../constants/http-status";
import { MESSAGES } from "../constants/messages";
import { JobService } from "../services/JobService";
import { ApiResponse } from "../utils/ApiResponse";

export class JobController {
  constructor(private readonly jobService: JobService) {}

  /**
   * GET /api/jobs
   */
  list = async (req: Request, res: Response): Promise<void> => {
    const result = await this.jobService.listPublic({
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 10),
      search: req.query.search as string | undefined,
      location: req.query.location as string | undefined,
      category: req.query.category as string | undefined,
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
      employmentType: req.query.employmentType as EmploymentType | undefined,
      experienceLevel: req.query.experienceLevel as ExperienceLevel | undefined,
      salaryMin: req.query.salaryMin ? Number(req.query.salaryMin) : undefined,
      salaryMax: req.query.salaryMax ? Number(req.query.salaryMax) : undefined,
      sortBy: req.query.sortBy as "createdAt" | "title" | "salaryMin" | undefined,
      sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
    });
    ApiResponse.paged(res, result.items, result.pagination);
  };

  /**
   * GET /api/jobs/my-jobs
   */
  myJobs = async (req: Request, res: Response): Promise<void> => {
    const result = await this.jobService.listMine(
      req.user!.id,
      Number(req.query.page ?? 1),
      Number(req.query.limit ?? 10),
      {
        status: req.query.status as JobStatus | undefined,
        search: req.query.search as string | undefined,
        location: req.query.location as string | undefined,
      },
    );
    ApiResponse.paged(res, result.items, result.pagination);
  };

  /**
   * GET /api/jobs/:id
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    const job = await this.jobService.getById(Number(req.params.id), req.user);
    ApiResponse.success(res, job);
  };

  /**
   * POST /api/jobs
   */
  create = async (req: Request, res: Response): Promise<void> => {
    const job = await this.jobService.create(req.user!.id, req.body);
    ApiResponse.success(res, job, MESSAGES.JOB.CREATED, HTTP_STATUS.CREATED);
  };

  /**
   * PATCH /api/jobs/:id
   */
  update = async (req: Request, res: Response): Promise<void> => {
    const job = await this.jobService.update(req.user!.id, req.user!.role, Number(req.params.id), req.body);
    ApiResponse.success(res, job, MESSAGES.JOB.UPDATED);
  };

  /**
   * DELETE /api/jobs/:id
   */
  remove = async (req: Request, res: Response): Promise<void> => {
    await this.jobService.delete(req.user!.id, req.user!.role, Number(req.params.id));
    ApiResponse.success(res, null, MESSAGES.JOB.DELETED);
  };

  /**
   * PATCH /api/jobs/:id/status
   */
  changeStatus = async (req: Request, res: Response): Promise<void> => {
    const job = await this.jobService.changeStatus(
      req.user!.id,
      req.user!.role,
      Number(req.params.id),
      req.body.status,
    );
    ApiResponse.success(res, job, MESSAGES.JOB.UPDATED);
  };

  /**
   * GET /api/jobs/:id/statistics
   */
  statistics = async (req: Request, res: Response): Promise<void> => {
    const stats = await this.jobService.statistics(req.user!.id, req.user!.role, Number(req.params.id));
    ApiResponse.success(res, stats);
  };
}
