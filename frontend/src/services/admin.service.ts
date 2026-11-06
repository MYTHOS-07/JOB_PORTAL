import { api } from "@/lib/api";
import type {
  AdminDashboard,
  ApiSuccess,
  Application,
  Company,
  CompanyStatus,
  Job,
  PaginationMeta,
  Role,
  User,
  UserStatus,
} from "@/types/api";

export const adminService = {
  users(page = 1, search?: string, role?: Role, status?: UserStatus) {
    return api<ApiSuccess<User[]> & { pagination: PaginationMeta }>("/admin/users", {
      query: { page, limit: 12, search, role, status },
    });
  },
  updateUserStatus(id: number, status: Extract<UserStatus, "ACTIVE" | "SUSPENDED">) {
    return api<ApiSuccess<User>>(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },
  updateUserRole(id: number, role: Role) {
    return api<ApiSuccess<User>>(`/admin/users/${id}/role`, {
      method: "PATCH",
      body: { role },
    });
  },
  jobs(page = 1, search?: string, status?: string) {
    return api<ApiSuccess<Job[]> & { pagination: PaginationMeta }>("/admin/jobs", {
      query: { page, limit: 12, search, status },
    });
  },
  deleteJob(id: number) {
    return api<ApiSuccess<null>>(`/admin/jobs/${id}`, { method: "DELETE" });
  },
  companies(page = 1, search?: string, status?: CompanyStatus, industry?: string) {
    return api<ApiSuccess<Company[]> & { pagination: PaginationMeta }>("/admin/companies", {
      query: { page, limit: 12, search, status, industry },
    });
  },
  updateCompanyStatus(id: number, status: CompanyStatus) {
    return api<ApiSuccess<Company>>(`/admin/companies/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },
  applications(page = 1, search?: string, status?: string) {
    return api<ApiSuccess<Application[]> & { pagination: PaginationMeta }>("/admin/applications", {
      query: { page, limit: 12, search, status },
    });
  },
  deleteUser(id: number) {
    return api<ApiSuccess<null>>(`/admin/users/${id}`, { method: "DELETE" });
  },
  reports() {
    return api<ApiSuccess<AdminDashboard>>("/admin/reports");
  },
};
