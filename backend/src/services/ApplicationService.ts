import type { ApplicationStatus, Role } from "../generated/prisma/client";
import { LOG_MARK } from "../constants/log-marks";
import { MESSAGES } from "../constants/messages";
import { logInfo } from "../utils/requestLog";
import { ApplicationDao } from "../dao/ApplicationDao";
import { JobDao } from "../dao/JobDao";
import { UserDao } from "../dao/UserDao";
import { ApiError } from "../utils/ApiError";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { CompanyService } from "./CompanyService";
import { EmailService } from "./EmailService";
import { NotificationService } from "./NotificationService";

/**
 * Job applications, duplicate prevention, and status workflow.
 */
export class ApplicationService {
  constructor(
    private readonly applicationDao: ApplicationDao,
    private readonly jobDao: JobDao,
    private readonly userDao: UserDao,
    private readonly companyService: CompanyService,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Submits an application for the authenticated job seeker.
   */
  async apply(applicantId: number, jobId: number, coverLetter?: string) {
    const job = await this.jobDao.findById(jobId);
    if (!job) {
      throw ApiError.notFound(MESSAGES.JOB.NOT_FOUND);
    }
    if (job.status !== "PUBLISHED") {
      throw ApiError.badRequest(MESSAGES.JOB.NOT_PUBLISHED);
    }
    if (job.applicationDeadline && job.applicationDeadline < new Date()) {
      throw ApiError.badRequest(MESSAGES.JOB.DEADLINE_PASSED);
    }

    const duplicate = await this.applicationDao.findByJobAndApplicant(jobId, applicantId);
    if (duplicate) {
      throw ApiError.conflict(MESSAGES.APPLICATION.DUPLICATE);
    }

    const application = await this.applicationDao.create({
      jobId,
      applicantId,
      coverLetter,
    });

    const applicant = await this.userDao.findById(applicantId);
    const employer = await this.userDao.findById(job.company.userId);

    if (applicant) {
      await this.emailService.sendApplicationConfirmation(
        applicant.email,
        applicant.name,
        job.title,
        job.company.companyName,
      );
      await this.notificationService.notify(
        applicant.id,
        "Application submitted",
        `You applied for ${job.title} at ${job.company.companyName}.`,
        "APPLICATION_SUBMITTED",
      );
    }

    if (employer) {
      await this.emailService.sendNewApplicationToEmployer(
        employer.email,
        employer.name,
        job.title,
        applicant?.name ?? "A candidate",
      );
      await this.notificationService.notify(
        employer.id,
        "New application",
        `${applicant?.name ?? "A candidate"} applied for ${job.title}.`,
        "NEW_APPLICATION",
      );
    }

    logInfo(
      {
        mark: LOG_MARK.APPLICATION_CREATE,
        actorUserId: applicantId,
        targetJobId: jobId,
        targetUserId: job.company.userId,
        module: "applications",
      },
      "Application submitted",
    );
    return application;
  }

  async getMine(
    applicantId: number,
    page: number,
    limit: number,
    filters: { search?: string; status?: ApplicationStatus } = {},
  ) {
    const { skip, take } = getPagination(page, limit);
    const { items, totalItems } = await this.applicationDao.listForApplicant(
      applicantId,
      skip,
      take,
      filters,
    );
    return { items, pagination: buildPaginationMeta(page, limit, totalItems) };
  }

  async getById(id: number, userId: number, role: Role) {
    const application = await this.applicationDao.findById(id);
    if (!application) {
      throw ApiError.notFound(MESSAGES.APPLICATION.NOT_FOUND);
    }

    const isApplicant = application.applicantId === userId;
    const isEmployer = application.job.company.userId === userId;
    const isAdmin = role === "ADMIN";

    if (!isApplicant && !isEmployer && !isAdmin) {
      throw ApiError.forbidden(MESSAGES.AUTH.FORBIDDEN);
    }

    return application;
  }

  async withdraw(id: number, applicantId: number) {
    const application = await this.applicationDao.findById(id);
    if (!application || application.applicantId !== applicantId) {
      throw ApiError.notFound(MESSAGES.APPLICATION.NOT_FOUND);
    }
    if (application.status === "WITHDRAWN") {
      return application;
    }
    const withdrawn = await this.applicationDao.update(id, { status: "WITHDRAWN" });
    logInfo(
      {
        mark: LOG_MARK.APPLICATION_WITHDRAW,
        actorUserId: applicantId,
        targetJobId: application.jobId,
        module: "applications",
      },
      "Application withdrawn",
    );
    return withdrawn;
  }

  async listForEmployer(
    userId: number,
    page: number,
    limit: number,
    filters: { jobId?: number; search?: string; status?: ApplicationStatus } = {},
  ) {
    const company = await this.companyService.requireOwnedCompany(userId);
    if (filters.jobId) {
      const job = await this.jobDao.findById(filters.jobId);
      if (!job || job.companyId !== company.id) {
        throw ApiError.forbidden(MESSAGES.AUTH.FORBIDDEN);
      }
    }

    const { skip, take } = getPagination(page, limit);
    const { items, totalItems } = await this.applicationDao.listForCompany(
      company.id,
      skip,
      take,
      filters,
    );
    return { items, pagination: buildPaginationMeta(page, limit, totalItems) };
  }

  async updateStatus(id: number, userId: number, role: Role, status: ApplicationStatus) {
    const application = await this.applicationDao.findById(id);
    if (!application) {
      throw ApiError.notFound(MESSAGES.APPLICATION.NOT_FOUND);
    }

    const isOwner = application.job.company.userId === userId;
    if (role !== "ADMIN" && !isOwner) {
      throw ApiError.forbidden(MESSAGES.AUTH.FORBIDDEN);
    }

    const updated = await this.applicationDao.update(id, { status });
    logInfo(
      {
        mark: LOG_MARK.APPLICATION_STATUS,
        actorUserId: userId,
        actorRole: role,
        targetUserId: application.applicantId,
        targetJobId: application.jobId,
        module: "applications",
        toStatus: status,
      },
      "Application status updated",
    );

    await this.emailService.sendApplicationStatusEmail(
      application.applicant.email,
      application.applicant.name,
      application.job.title,
      status,
    );
    await this.notificationService.notify(
      application.applicantId,
      "Application update",
      `Your application for ${application.job.title} is now ${status}.`,
      "APPLICATION_STATUS",
    );

    return updated;
  }

  async listAll(
    page: number,
    limit: number,
    filters: { search?: string; status?: ApplicationStatus; jobId?: number } = {},
  ) {
    const { skip, take } = getPagination(page, limit);
    const { items, totalItems } = await this.applicationDao.listAll(skip, take, filters);
    return { items, pagination: buildPaginationMeta(page, limit, totalItems) };
  }
}
