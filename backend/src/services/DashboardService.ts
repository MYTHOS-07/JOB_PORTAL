import { ApplicationDao } from "../dao/ApplicationDao";
import { CompanyDao } from "../dao/CompanyDao";
import { JobDao } from "../dao/JobDao";
import { UserDao } from "../dao/UserDao";
import { User } from "../models/User";
import { CompanyService } from "./CompanyService";

/**
 * Role-specific dashboard statistics using Prisma aggregate counts.
 */
export class DashboardService {
  constructor(
    private readonly userDao: UserDao,
    private readonly companyDao: CompanyDao,
    private readonly jobDao: JobDao,
    private readonly applicationDao: ApplicationDao,
    private readonly companyService: CompanyService,
  ) {}

  async seeker(userId: number) {
    const [total, pending, reviewing, shortlisted, interview, rejected, accepted, recent, latestJobs] =
      await Promise.all([
        this.applicationDao.countByApplicantAndStatus(userId),
        this.applicationDao.countByApplicantAndStatus(userId, "PENDING"),
        this.applicationDao.countByApplicantAndStatus(userId, "REVIEWING"),
        this.applicationDao.countByApplicantAndStatus(userId, "SHORTLISTED"),
        this.applicationDao.countByApplicantAndStatus(userId, "INTERVIEW"),
        this.applicationDao.countByApplicantAndStatus(userId, "REJECTED"),
        this.applicationDao.countByApplicantAndStatus(userId, "ACCEPTED"),
        this.applicationDao.listForApplicant(userId, 0, 8),
        this.jobDao.list({ skip: 0, take: 6, status: "PUBLISHED" }),
      ]);

    return {
      totals: {
        applications: total,
        pending,
        reviewing,
        shortlisted,
        interview,
        rejected,
        accepted,
      },
      recentApplications: recent.items,
      recommendedJobs: latestJobs.items,
    };
  }

  async employer(userId: number) {
    const company = await this.companyService.requireOwnedCompany(userId);
    const [totalJobs, published, closed, totalApplicants, pending, recent] = await Promise.all([
      this.jobDao.countByCompany(company.id),
      this.jobDao.list({ skip: 0, take: 1, companyId: company.id, status: "PUBLISHED" }),
      this.jobDao.list({ skip: 0, take: 1, companyId: company.id, status: "CLOSED" }),
      this.applicationDao.countByCompany(company.id),
      this.applicationDao.countByCompany(company.id, "PENDING"),
      this.applicationDao.listForCompany(company.id, 0, 5),
    ]);

    return {
      company,
      totals: {
        jobs: totalJobs,
        activeJobs: published.totalItems,
        closedJobs: closed.totalItems,
        applicants: totalApplicants,
        pendingApplications: pending,
      },
      recentApplications: recent.items,
    };
  }

  async admin() {
    const [
      users,
      seekers,
      employers,
      admins,
      companies,
      jobs,
      published,
      applications,
      recentUsers,
      recentJobs,
      recentApplications,
    ] = await Promise.all([
      this.userDao.countAll(),
      this.userDao.countByRole("JOB_SEEKER"),
      this.userDao.countByRole("EMPLOYER"),
      this.userDao.countByRole("ADMIN"),
      this.companyDao.countAll(),
      this.jobDao.countAll(),
      this.jobDao.countByStatus("PUBLISHED"),
      this.applicationDao.countAll(),
      this.userDao.listUsers({ skip: 0, take: 8 }),
      this.jobDao.list({ skip: 0, take: 8 }),
      this.applicationDao.listAll(0, 8),
    ]);

    return {
      totals: {
        users,
        seekers,
        employers,
        admins,
        companies,
        jobs,
        publishedJobs: published,
        applications,
      },
      recentUsers: recentUsers.items.map((user) => ({
        ...User.fromPrisma(user).toPublic(),
        company: user.company,
      })),
      recentJobs: recentJobs.items,
      recentApplications: recentApplications.items,
    };
  }
}
