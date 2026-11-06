import { describe, expect, it } from "vitest";
import { applicationStatusSchema, applySchema } from "../../src/validators/application.schema";

describe("applySchema", () => {
  it("accepts a job id with an optional cover letter", () => {
    expect(applySchema.safeParse({ body: { jobId: 24, coverLetter: "Please consider me." } }).success).toBe(true);
  });

  it("rejects a missing job id", () => {
    expect(applySchema.safeParse({ body: { coverLetter: "No job" } }).success).toBe(false);
  });
});

describe("applicationStatusSchema", () => {
  it("allows employer workflow statuses and rejects WITHDRAWN from this endpoint", () => {
    expect(
      applicationStatusSchema.safeParse({ params: { id: 1 }, body: { status: "REVIEWING" } }).success,
    ).toBe(true);
    expect(
      applicationStatusSchema.safeParse({ params: { id: 1 }, body: { status: "WITHDRAWN" } }).success,
    ).toBe(false);
  });
});
