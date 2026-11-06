import { api } from "@/lib/api";
import type { ApiSuccess, Application, ApplicationStatus, PaginationMeta } from "@/types/api";

export const applicationService = {
  apply(jobId: number, coverLetter?: string) {
    return api<ApiSuccess<Application>>("/applications", {
      method: "POST",
      body: { jobId, coverLetter },
    });
  },
  mine(page = 1, search?: string, status?: ApplicationStatus) {
    return api<ApiSuccess<Application[]> & { pagination: PaginationMeta }>(
      "/applications/my-applications",
      { query: { page, limit: 10, search, status } },
    );
  },
  employer(page = 1, jobId?: number, search?: string, status?: ApplicationStatus) {
    return api<ApiSuccess<Application[]> & { pagination: PaginationMeta }>("/applications/employer", {
      query: { page, limit: 10, jobId, search, status },
    });
  },
  updateStatus(id: number, status: ApplicationStatus) {
    return api<ApiSuccess<Application>>(`/applications/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },
  withdraw(id: number) {
    return api<ApiSuccess<Application>>(`/applications/${id}/withdraw`, { method: "PATCH" });
  },
  get(id: number) {
    return api<ApiSuccess<Application>>(`/applications/${id}`);
  },
};
