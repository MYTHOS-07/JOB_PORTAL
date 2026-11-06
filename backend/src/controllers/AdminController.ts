import type { Request, Response } from "express";
import { ApplicationService } from "../services/ApplicationService";
import { CompanyService } from "../services/CompanyService";
import { DashboardService } from "../services/DashboardService";
import { JobService } from "../services/JobService";
import { UserService } from "../services/UserService";
import { ApiResponse } from "../utils/ApiResponse";

export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly jobService: JobService,
    private readonly applicationService: ApplicationService,
    private readonly dashboardService: DashboardService,
  ) {}

  dashboard = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.dashboardService.admin();
    ApiResponse.success(res, data);
  };

  users = async (req: Request, res: Response): Promise<void> => {
    const result = await this.userService.listUsers({
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 10),
      role: req.query.role as "JOB_SEEKER" | "EMPLOYER" | "ADMIN" | undefined,
      status: req.query.status as "ACTIVE" | "SUSPENDED" | "DELETED" | undefined,
      search: req.query.search as string | undefined,
    });
    ApiResponse.paged(res, result.items, result.pagination);
  };

  userById = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.getMe(Number(req.params.id));
    ApiResponse.success(res, user);
  };

  updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.updateStatus(Number(req.params.id), req.body.status);
    ApiResponse.success(res, user);
  };

  updateUserRole = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.updateRole(req.user!.id, Number(req.params.id), req.body.role);
    ApiResponse.success(res, user, "User role updated.");
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    await this.userService.adminDeleteUser(Number(req.params.id));
    ApiResponse.success(res, null, "User deactivated.");
  };

  companies = async (req: Request, res: Response): Promise<void> => {
    const result = await this.companyService.adminList(
      Number(req.query.page ?? 1),
      Number(req.query.limit ?? 10),
      {
        search: req.query.search as string | undefined,
        status: req.query.status as "PENDING" | "APPROVED" | "SUSPENDED" | undefined,
        location: req.query.location as string | undefined,
        industry: req.query.industry as string | undefined,
      },
    );
    ApiResponse.paged(res, result.items, result.pagination);
  };

  updateCompanyStatus = async (req: Request, res: Response): Promise<void> => {
    const company = await this.companyService.updateStatus(Number(req.params.id), req.body.status);
    ApiResponse.success(res, company);
  };

  jobs = async (req: Request, res: Response): Promise<void> => {
    const result = await this.jobService.listAllForAdmin(
      Number(req.query.page ?? 1),
      Number(req.query.limit ?? 10),
      {
        search: req.query.search as string | undefined,
        status: req.query.status as "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED" | undefined,
        location: req.query.location as string | undefined,
      },
    );
    ApiResponse.paged(res, result.items, result.pagination);
  };

  deleteJob = async (req: Request, res: Response): Promise<void> => {
    await this.jobService.delete(req.user!.id, req.user!.role, Number(req.params.id));
    ApiResponse.success(res, null, "Job removed.");
  };

  applications = async (req: Request, res: Response): Promise<void> => {
    const result = await this.applicationService.listAll(
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
        jobId: req.query.jobId ? Number(req.query.jobId) : undefined,
      },
    );
    ApiResponse.paged(res, result.items, result.pagination);
  };

  reports = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.dashboardService.admin();
    ApiResponse.success(res, data);
  };
}
