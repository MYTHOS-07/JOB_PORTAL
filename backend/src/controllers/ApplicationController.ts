import type { Request, Response } from "express";
import { HTTP_STATUS } from "../constants/http-status";
import { MESSAGES } from "../constants/messages";
import { ApplicationService } from "../services/ApplicationService";
import { ApiResponse } from "../utils/ApiResponse";

export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  /**
   * POST /api/applications
   */
  apply = async (req: Request, res: Response): Promise<void> => {
    const application = await this.applicationService.apply(
      req.user!.id,
      req.body.jobId,
      req.body.coverLetter,
    );
    ApiResponse.success(res, application, MESSAGES.APPLICATION.CREATED, HTTP_STATUS.CREATED);
  };

  /**
   * GET /api/applications/my-applications
   */
  myApplications = async (req: Request, res: Response): Promise<void> => {
    const result = await this.applicationService.getMine(
      req.user!.id,
      Number(req.query.page ?? 1),
      Number(req.query.limit ?? 10),
      {
        search: req.query.search as string | undefined,
        status: req.query.status as
          | "PENDING"
          | "REVIEWING"
          | "SHORTLISTED"
          | "INTERVIEW"
          | "REJECTED"
          | "ACCEPTED"
          | "WITHDRAWN"
          | undefined,
      },
    );
    ApiResponse.paged(res, result.items, result.pagination);
  };

  /**
   * GET /api/applications/employer
   */
  employerApplications = async (req: Request, res: Response): Promise<void> => {
    const result = await this.applicationService.listForEmployer(
      req.user!.id,
      Number(req.query.page ?? 1),
      Number(req.query.limit ?? 10),
      {
        jobId: req.query.jobId ? Number(req.query.jobId) : undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as
          | "PENDING"
          | "REVIEWING"
          | "SHORTLISTED"
          | "INTERVIEW"
          | "REJECTED"
          | "ACCEPTED"
          | "WITHDRAWN"
          | undefined,
      },
    );
    ApiResponse.paged(res, result.items, result.pagination);
  };

  /**
   * GET /api/applications/job/:jobId
   */
  byJob = async (req: Request, res: Response): Promise<void> => {
    const result = await this.applicationService.listForEmployer(
      req.user!.id,
      Number(req.query.page ?? 1),
      Number(req.query.limit ?? 10),
      {
        jobId: Number(req.params.jobId),
        search: req.query.search as string | undefined,
        status: req.query.status as
          | "PENDING"
          | "REVIEWING"
          | "SHORTLISTED"
          | "INTERVIEW"
          | "REJECTED"
          | "ACCEPTED"
          | "WITHDRAWN"
          | undefined,
      },
    );
    ApiResponse.paged(res, result.items, result.pagination);
  };

  /**
   * GET /api/applications/:id
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    const application = await this.applicationService.getById(
      Number(req.params.id),
      req.user!.id,
      req.user!.role,
    );
    ApiResponse.success(res, application);
  };

  /**
   * PATCH /api/applications/:id/withdraw
   */
  withdraw = async (req: Request, res: Response): Promise<void> => {
    const application = await this.applicationService.withdraw(Number(req.params.id), req.user!.id);
    ApiResponse.success(res, application, MESSAGES.APPLICATION.WITHDRAWN);
  };

  /**
   * PATCH /api/applications/:id/status
   */
  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const application = await this.applicationService.updateStatus(
      Number(req.params.id),
      req.user!.id,
      req.user!.role,
      req.body.status,
    );
    ApiResponse.success(res, application, MESSAGES.APPLICATION.STATUS_UPDATED);
  };
}
