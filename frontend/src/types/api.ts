export type Role = "JOB_SEEKER" | "EMPLOYER" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";
export type CompanyStatus = "PENDING" | "APPROVED" | "SUSPENDED";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "REMOTE";
export type ExperienceLevel = "ENTRY_LEVEL" | "MID_LEVEL" | "SENIOR" | "LEAD";
export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
export type ApplicationStatus =
  | "PENDING"
  | "REVIEWING"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "REJECTED"
  | "ACCEPTED"
  | "WITHDRAWN";

export interface PaginationMeta {
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface UserProfile {
  id: number;
  userId: number;
  phone: string | null;
  location: string | null;
  resumeUrl: string | null;
  bio: string | null;
}

export interface Company {
  id: number;
  userId: number;
  companyName: string;
  description: string | null;
  industry: string | null;
  website: string | null;
  location: string | null;
  phone: string | null;
  logoUrl: string | null;
  status: CompanyStatus;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  avatarUrl: string | null;
  createdAt: string;
  profile?: UserProfile | null;
  company?: Company | null;
}

export interface JobCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Job {
  id: number;
  companyId: number;
  categoryId: number;
  title: string;
  description: string;
  location: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin: string | number | null;
  salaryMax: string | number | null;
  status: JobStatus;
  applicationDeadline: string | null;
  createdAt: string;
  company?: Pick<Company, "id" | "companyName" | "location" | "logoUrl">;
  category?: JobCategory;
  _count?: { applications: number };
}

export interface Application {
  id: number;
  jobId: number;
  applicantId: number;
  coverLetter: string | null;
  status: ApplicationStatus;
  appliedAt: string;
  job?: Job;
  applicant?: Pick<User, "id" | "name" | "email" | "avatarUrl"> & {
    profile?: UserProfile | null;
  };
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface SeekerDashboard {
  totals: Record<string, number>;
  recentApplications: Application[];
  recommendedJobs: Job[];
}

export interface EmployerDashboard {
  totals: Record<string, number>;
  company?: Company;
  recentApplications: Application[];
}

export interface AdminDashboard {
  totals: Record<string, number>;
  recentUsers: User[];
  recentJobs: Job[];
  recentApplications: Application[];
}

export interface JobListQuery {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  category?: string;
  employmentType?: EmploymentType;
  experienceLevel?: ExperienceLevel;
  status?: JobStatus;
}
