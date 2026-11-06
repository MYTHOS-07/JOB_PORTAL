import { LOG_MARK } from "../constants/log-marks";
import { MESSAGES } from "../constants/messages";
import { logInfo } from "../utils/requestLog";
import { CompanyDao } from "../dao/CompanyDao";
import { JobDao } from "../dao/JobDao";
import { ApiError } from "../utils/ApiError";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { NotificationService } from "./NotificationService";

/**
 * Company profile CRUD with one-company-per-employer rule.
 */
export class CompanyService {
  constructor(
    private readonly companyDao: CompanyDao,
    private readonly jobDao: JobDao,
    private readonly notificationService: NotificationService,
  ) {}

  async create(userId: number, data: {
    companyName: string;
    description?: string;
    industry?: string;
    website?: string;
    location?: string;
    phone?: string;
  }) {
    const existing = await this.companyDao.findByUserId(userId);
    if (existing) {
      throw ApiError.conflict(MESSAGES.COMPANY.ALREADY_EXISTS);
    }

    const company = await this.companyDao.create({
      userId,
      companyName: data.companyName,
      description: data.description,
      industry: data.industry,
      website: data.website,
      location: data.location,
      phone: data.phone,
    });
    logInfo(
      { mark: LOG_MARK.COMPANY_CREATE, actorUserId: userId, module: "companies" },
      "Company created",
    );
    return company;
  }

  async getMine(userId: number) {
    const company = await this.companyDao.findByUserId(userId);
    if (!company) {
      throw ApiError.notFound(MESSAGES.COMPANY.NOT_FOUND);
    }
    return company;
  }

  async updateMine(userId: number, data: Record<string, unknown>) {
    const company = await this.requireOwnedCompany(userId);
    const updated = await this.companyDao.update(company.id, data);
    logInfo(
      { mark: LOG_MARK.COMPANY_UPDATE, actorUserId: userId, module: "companies" },
      "Company updated",
    );
    return updated;
  }

  async updateLogo(userId: number, logoUrl: string) {
    const company = await this.requireOwnedCompany(userId);
    return this.companyDao.update(company.id, { logoUrl });
  }

  async deleteMine(userId: number) {
    const company = await this.requireOwnedCompany(userId);
    return this.companyDao.delete(company.id);
  }

  async getById(id: number) {
    const company = await this.companyDao.findById(id);
    if (!company || company.status === "SUSPENDED") {
      throw ApiError.notFound(MESSAGES.COMPANY.NOT_FOUND);
    }
    return company;
  }

  async list(
    page: number,
    limit: number,
    filters: { search?: string; location?: string; industry?: string } = {},
  ) {
    const { skip, take } = getPagination(page, limit);
    const { items, totalItems } = await this.companyDao.list({
      skip,
      take,
      search: filters.search,
      location: filters.location,
      industry: filters.industry,
      status: "APPROVED",
    });
    return { items, pagination: buildPaginationMeta(page, limit, totalItems) };
  }

  async listJobs(companyId: number, page: number, limit: number) {
    await this.getById(companyId);
    const { skip, take } = getPagination(page, limit);
    const { items, totalItems } = await this.jobDao.list({
      skip,
      take,
      companyId,
      status: "PUBLISHED",
    });
    return { items, pagination: buildPaginationMeta(page, limit, totalItems) };
  }

  async adminList(
    page: number,
    limit: number,
    filters: {
      search?: string;
      status?: "PENDING" | "APPROVED" | "SUSPENDED";
      location?: string;
      industry?: string;
    } = {},
  ) {
    const { skip, take } = getPagination(page, limit);
    const { items, totalItems } = await this.companyDao.list({
      skip,
      take,
      search: filters.search,
      status: filters.status,
      location: filters.location,
      industry: filters.industry,
    });
    return { items, pagination: buildPaginationMeta(page, limit, totalItems) };
  }

  async updateStatus(id: number, status: "PENDING" | "APPROVED" | "SUSPENDED") {
    const company = await this.companyDao.findById(id);
    if (!company) {
      throw ApiError.notFound(MESSAGES.COMPANY.NOT_FOUND);
    }
    const updated = await this.companyDao.update(id, { status });
    logInfo(
      {
        mark: LOG_MARK.COMPANY_STATUS,
        targetUserId: company.userId,
        module: "admin",
        toStatus: status,
      },
      "Company status updated",
    );
    await this.notificationService.notify(
      company.userId,
      "Company status updated",
      `Your company profile is now ${status.toLowerCase()}.`,
      "COMPANY_STATUS",
    );
    return updated;
  }

  async requireOwnedCompany(userId: number) {
    const company = await this.companyDao.findByUserId(userId);
    if (!company) {
      throw ApiError.notFound(MESSAGES.COMPANY.NOT_FOUND);
    }
    if (company.status === "SUSPENDED") {
      throw ApiError.forbidden(MESSAGES.COMPANY.SUSPENDED);
    }
    return company;
  }
}
