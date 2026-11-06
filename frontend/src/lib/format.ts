import type { ApplicationStatus, EmploymentType, ExperienceLevel, JobStatus, Role } from "@/types/api";

export function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatSalary(min?: string | number | null, max?: string | number | null) {
  const toNumber = (value: string | number | null | undefined) =>
    value === null || value === undefined || value === "" ? null : Number(value);

  const low = toNumber(min);
  const high = toNumber(max);
  if (low === null && high === null) return "Salary not listed";

  const npr = (amount: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(amount);

  if (low !== null && high !== null) return `${npr(low)} – ${npr(high)}`;
  return npr(low ?? high ?? 0);
}

export const employmentLabels: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  REMOTE: "Remote",
};

export const experienceLabels: Record<ExperienceLevel, string> = {
  ENTRY_LEVEL: "Entry",
  MID_LEVEL: "Mid",
  SENIOR: "Senior",
  LEAD: "Lead",
};

export const jobStatusLabels: Record<JobStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  PENDING: "Pending",
  REVIEWING: "Reviewing",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  REJECTED: "Rejected",
  ACCEPTED: "Accepted",
  WITHDRAWN: "Withdrawn",
};

export const roleLabels: Record<Role, string> = {
  JOB_SEEKER: "Job seeker",
  EMPLOYER: "Employer",
  ADMIN: "Admin",
};

export function dashboardPath(role: Role) {
  if (role === "EMPLOYER") return "/employer/dashboard";
  if (role === "ADMIN") return "/admin/dashboard";
  return "/seeker/dashboard";
}

export function assetUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const origin = process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:4000";
  return `${origin}${path}`;
}
