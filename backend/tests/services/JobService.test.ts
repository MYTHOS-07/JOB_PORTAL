import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/config/database", () => ({ prisma: {} }));
vi.mock("../../src/config/redis", () => ({
  redis: { keys: vi.fn().mockResolvedValue([]), del: vi.fn(), get: vi.fn(), set: vi.fn() },
}));
vi.mock("../../src/utils/requestLog", () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

import { JobService } from "../../src/services/JobService";
import { MESSAGES } from "../../src/constants/messages";

function createService() {
  const jobDao = { create: vi.fn(), findById: vi.fn(), update: vi.fn(), delete: vi.fn(), list: vi.fn() };
  const categoryDao = { findById: vi.fn() };
  const applicationDao = { countForJob: vi.fn() };
  const companyService = { requireOwnedCompany: vi.fn() };
  const notificationService = { notify: vi.fn() };

  const service = new JobService(
    jobDao as never,
    categoryDao as never,
    applicationDao as never,
    companyService as never,
    notificationService as never,
  );

  return { service, jobDao, categoryDao, companyService };
}

describe("JobService.create", () => {
  it("stores a vacancy as DRAFT by default", async () => {
    const { service, jobDao, categoryDao, companyService } = createService();
    companyService.requireOwnedCompany.mockResolvedValue({ id: 1, userId: 9 });
    categoryDao.findById.mockResolvedValue({ id: 1, name: "Administration" });
    jobDao.create.mockResolvedValue({ id: 24, title: "Assignment Test Vacancy", status: "DRAFT", companyId: 1 });

    const job = await service.create(9, {
      title: "Assignment Test Vacancy",
      description: "Created during unit testing.",
      location: "Kathmandu, Nepal",
      employmentType: "FULL_TIME",
      categoryId: 1,
    });

    expect(job.status).toBe("DRAFT");
    expect(jobDao.create).toHaveBeenCalledWith(expect.objectContaining({ status: "DRAFT", companyId: 1 }));
  });
});

describe("JobService ownership", () => {
  it("hides unpublished jobs from the public", async () => {
    const { service, jobDao } = createService();
    jobDao.findById.mockResolvedValue({
      id: 24,
      status: "DRAFT",
      company: { userId: 9 },
    });

    await expect(service.getById(24)).rejects.toMatchObject({
      statusCode: 404,
      message: MESSAGES.JOB.NOT_FOUND,
    });
  });

  it("forbids another employer from updating a job", async () => {
    const { service, jobDao } = createService();
    jobDao.findById.mockResolvedValue({
      id: 24,
      status: "PUBLISHED",
      company: { userId: 9 },
    });

    await expect(service.update(12, "EMPLOYER", 24, { title: "Hijacked" })).rejects.toMatchObject({
      statusCode: 403,
      message: MESSAGES.AUTH.FORBIDDEN,
    });
  });
});
