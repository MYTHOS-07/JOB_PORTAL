import type { Request, Response } from "express";
import { HTTP_STATUS } from "../constants/http-status";
import { MESSAGES } from "../constants/messages";
import { CompanyService } from "../services/CompanyService";
import { storageService } from "../services/StorageService";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * POST /api/companies
   */
  create = async (req: Request, res: Response): Promise<void> => {
    const company = await this.companyService.create(req.user!.id, req.body);
    ApiResponse.success(res, company, MESSAGES.COMPANY.CREATED, HTTP_STATUS.CREATED);
  };

  /**
   * GET /api/companies
   */
  list = async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const result = await this.companyService.list(page, limit, {
      search: req.query.search as string | undefined,
      location: req.query.location as string | undefined,
      industry: req.query.industry as string | undefined,
    });
    ApiResponse.paged(res, result.items, result.pagination);
  };

  /**
   * GET /api/companies/me
   */
  getMine = async (req: Request, res: Response): Promise<void> => {
    const company = await this.companyService.getMine(req.user!.id);
    ApiResponse.success(res, company);
  };

  /**
   * PATCH /api/companies/me
   */
  updateMine = async (req: Request, res: Response): Promise<void> => {
    const company = await this.companyService.updateMine(req.user!.id, req.body);
    ApiResponse.success(res, company, MESSAGES.COMPANY.UPDATED);
  };

  /**
   * PATCH /api/companies/me/logo
   */
  updateLogo = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw ApiError.badRequest("A logo image is required.");
    }
    const logoUrl = await storageService.saveImage(req.file, "logos");
    const company = await this.companyService.updateLogo(req.user!.id, logoUrl);
    ApiResponse.success(res, company, MESSAGES.COMPANY.UPDATED);
  };

  /**
   * DELETE /api/companies/me
   */
  deleteMine = async (req: Request, res: Response): Promise<void> => {
    await this.companyService.deleteMine(req.user!.id);
    ApiResponse.success(res, null, MESSAGES.COMPANY.DELETED);
  };

  /**
   * GET /api/companies/:id
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    const company = await this.companyService.getById(Number(req.params.id));
    ApiResponse.success(res, company);
  };

  /**
   * GET /api/companies/:id/jobs
   */
  listJobs = async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const result = await this.companyService.listJobs(Number(req.params.id), page, limit);
    ApiResponse.paged(res, result.items, result.pagination);
  };
}
