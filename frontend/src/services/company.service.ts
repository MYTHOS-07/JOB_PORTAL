import { api } from "@/lib/api";
import type { ApiSuccess, Company, Job, PaginationMeta } from "@/types/api";

export const companyService = {
  list(page = 1, search?: string, location?: string, industry?: string) {
    return api<ApiSuccess<Company[]> & { pagination: PaginationMeta }>("/companies", {
      query: { page, limit: 12, search, location, industry },
    });
  },
  get(id: number) {
    return api<ApiSuccess<Company>>(`/companies/${id}`);
  },
  jobs(id: number, page = 1) {
    return api<ApiSuccess<Job[]> & { pagination: PaginationMeta }>(`/companies/${id}/jobs`, {
      query: { page, limit: 10 },
    });
  },
  mine() {
    return api<ApiSuccess<Company>>("/companies/me");
  },
  create(body: Record<string, unknown>) {
    return api<ApiSuccess<Company>>("/companies", { method: "POST", body });
  },
  update(body: Record<string, unknown>) {
    return api<ApiSuccess<Company>>("/companies/me", { method: "PATCH", body });
  },
  uploadLogo(file: File) {
    const body = new FormData();
    body.append("logo", file);
    return api<ApiSuccess<Company>>("/companies/me/logo", { method: "PATCH", body });
  },
  remove() {
    return api<ApiSuccess<null>>("/companies/me", { method: "DELETE" });
  },
};
