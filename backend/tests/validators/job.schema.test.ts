import { describe, expect, it } from "vitest";
import { createJobSchema, jobStatusSchema } from "../../src/validators/job.schema";

describe("createJobSchema", () => {
  it("accepts a complete employer vacancy", () => {
    const parsed = createJobSchema.safeParse({
      body: {
        title: "Office Administrator",
        description: "Manage vendor bills and meeting rooms.",
        location: "Kathmandu",
        employmentType: "FULL_TIME",
        categoryId: 1,
        status: "DRAFT",
      },
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a title that is too short", () => {
    const parsed = createJobSchema.safeParse({
      body: {
        title: "IT",
        description: "Too short title should fail validation.",
        location: "Kathmandu",
        employmentType: "FULL_TIME",
        categoryId: 1,
      },
    });
    expect(parsed.success).toBe(false);
  });
});

describe("jobStatusSchema", () => {
  it("allows PUBLISHED and rejects unknown statuses", () => {
    expect(
      jobStatusSchema.safeParse({ params: { id: 1 }, body: { status: "PUBLISHED" } }).success,
    ).toBe(true);
    expect(
      jobStatusSchema.safeParse({ params: { id: 1 }, body: { status: "OPEN" } }).success,
    ).toBe(false);
  });
});
