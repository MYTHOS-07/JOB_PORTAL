import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/config/database", () => ({ prisma: {} }));
vi.mock("../../src/config/redis", () => ({
  redis: { keys: vi.fn().mockResolvedValue([]), del: vi.fn(), get: vi.fn(), set: vi.fn() },
}));
vi.mock("../../src/config/email", () => ({ mailTransport: { sendMail: vi.fn() } }));
vi.mock("../../src/utils/requestLog", () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

import { ApplicationService } from "../../src/services/ApplicationService";
import { ApiError } from "../../src/utils/ApiError";
import { MESSAGES } from "../../src/constants/messages";

const publishedJob = {
  id: 24,
  status: "PUBLISHED",
  applicationDeadline: null,
  title: "Office Administrator",
  company: { userId: 9, companyName: "Tech Solutions Nepal" },
};

function createService() {
  const applicationDao = {
    findByJobAndApplicant: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    listForApplicant: vi.fn(),
    listForCompany: vi.fn(),
    listAll: vi.fn(),
  };
  const jobDao = { findById: vi.fn() };
  const userDao = { findById: vi.fn() };
  const companyService = { requireOwnedCompany: vi.fn() };
  const emailService = {
    sendApplicationConfirmation: vi.fn(),
    sendNewApplicationToEmployer: vi.fn(),
    sendApplicationStatusEmail: vi.fn(),
  };
  const notificationService = { notify: vi.fn() };

  const service = new ApplicationService(
    applicationDao as never,
    jobDao as never,
    userDao as never,
    companyService as never,
    emailService as never,
    notificationService as never,
  );

  return { service, applicationDao, jobDao, userDao };
}

describe("ApplicationService.apply", () => {
  let ctx: ReturnType<typeof createService>;

  beforeEach(() => {
    ctx = createService();
  });

  it("creates an application for a published job", async () => {
    ctx.jobDao.findById.mockResolvedValue(publishedJob);
    ctx.applicationDao.findByJobAndApplicant.mockResolvedValue(null);
    ctx.applicationDao.create.mockResolvedValue({ id: 30, jobId: 24, applicantId: 3, status: "PENDING" });
    ctx.userDao.findById.mockResolvedValue({ id: 3, email: "seeker@elevateworkforce.local", name: "Demo Seeker" });

    const result = await ctx.service.apply(3, 24, "Please consider me.");
    expect(result.status).toBe("PENDING");
    expect(ctx.applicationDao.create).toHaveBeenCalledWith({
      jobId: 24,
      applicantId: 3,
      coverLetter: "Please consider me.",
    });
  });

  it("rejects a duplicate application", async () => {
    ctx.jobDao.findById.mockResolvedValue(publishedJob);
    ctx.applicationDao.findByJobAndApplicant.mockResolvedValue({ id: 1 });

    await expect(ctx.service.apply(3, 24)).rejects.toMatchObject({
      statusCode: 409,
      message: MESSAGES.APPLICATION.DUPLICATE,
    } satisfies Partial<ApiError>);
  });

  it("rejects applications to a draft job", async () => {
    ctx.jobDao.findById.mockResolvedValue({ ...publishedJob, status: "DRAFT" });

    await expect(ctx.service.apply(3, 24)).rejects.toMatchObject({
      statusCode: 400,
      message: MESSAGES.JOB.NOT_PUBLISHED,
    });
  });
});
