import { describe, expect, it } from "vitest";
import { createJobSchema } from "../src/validators/job.schema";

describe("job validation", () => {
  it("accepts a valid job payload", () => {
    const result = createJobSchema.safeParse({
      body: {
        title: "Junior Full Stack Developer",
        description: "We are looking for a junior developer.",
        location: "Kathmandu",
        employmentType: "FULL_TIME",
        categoryId: 1,
        experienceLevel: "ENTRY_LEVEL",
        salaryMin: 20000,
        salaryMax: 40000,
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a short title", () => {
    const result = createJobSchema.safeParse({
      body: {
        title: "JS",
        description: "Too short title",
        location: "Kathmandu",
        employmentType: "FULL_TIME",
        categoryId: 1,
      },
    });
    expect(result.success).toBe(false);
  });
});
