import { describe, expect, it } from "vitest";
import { dashboardPath, formatSalary, roleLabels } from "./format";

describe("dashboardPath", () => {
  it("sends each role to the matching dashboard", () => {
    expect(dashboardPath("JOB_SEEKER")).toBe("/seeker/dashboard");
    expect(dashboardPath("EMPLOYER")).toBe("/employer/dashboard");
    expect(dashboardPath("ADMIN")).toBe("/admin/dashboard");
  });
});

describe("formatSalary", () => {
  it("shows a readable range for Nepal rupees", () => {
    expect(formatSalary(28000, 40000)).toContain("28,000");
    expect(formatSalary(28000, 40000)).toContain("40,000");
  });

  it("handles missing salary", () => {
    expect(formatSalary(null, null)).toBe("Salary not listed");
  });
});

describe("roleLabels", () => {
  it("uses plain English on dashboards and forms", () => {
    expect(roleLabels.JOB_SEEKER).toBe("Job seeker");
    expect(roleLabels.EMPLOYER).toBe("Employer");
  });
});
