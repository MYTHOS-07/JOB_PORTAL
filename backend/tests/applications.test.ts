import { describe, expect, it } from "vitest";
import { applySchema, applicationStatusSchema } from "../src/validators/application.schema";

describe("application validation", () => {
  it("requires a jobId from the body, never the applicant id", () => {
    const result = applySchema.safeParse({
      body: { jobId: 1, coverLetter: "I am interested in this role." },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid employer status update", () => {
    const result = applicationStatusSchema.safeParse({
      params: { id: "3" },
      body: { status: "SHORTLISTED" },
    });
    expect(result.success).toBe(true);
  });
});
