import { api } from "@/lib/api";
import type { ApiSuccess, Job, JobListQuery, JobStatus, PaginationMeta } from "@/types/api";

export const jobService = {
  list(query: JobListQuery = {}) {
    return api<ApiSuccess<Job[]> & { pagination: PaginationMeta }>("/jobs", {
      query: query as Record<string, string | number | undefined>,
    });
  },
  get(id: number) {
    return api<ApiSuccess<Job>>(`/jobs/${id}`);
  },
  myJobs(query: JobListQuery = {}) {
    return api<ApiSuccess<Job[]> & { pagination: PaginationMeta }>("/jobs/my-jobs", {
      query: query as Record<string, string | number | undefined>,
    });
  },
  create(body: Record<string, unknown>) {
    return api<ApiSuccess<Job>>("/jobs", { method: "POST", body });
  },
  update(id: number, body: Record<string, unknown>) {
    return api<ApiSuccess<Job>>(`/jobs/${id}`, { method: "PATCH", body });
  },
  changeStatus(id: number, status: JobStatus) {
    return api<ApiSuccess<Job>>(`/jobs/${id}/status`, { method: "PATCH", body: { status } });
  },
  remove(id: number) {
    return api<ApiSuccess<null>>(`/jobs/${id}`, { method: "DELETE" });
  },
  statistics(id: number) {
    return api<ApiSuccess<{ jobId: number; title: string; status: JobStatus; totalApplications: number }>>(
      `/jobs/${id}/statistics`,
    );
  },
};
