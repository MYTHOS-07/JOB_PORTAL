import { EmptyState } from "@/components/common/EmptyState";
import { FilterBar, FilterInput, FilterSelect } from "@/components/common/FilterBar";
import { Pagination } from "@/components/common/Pagination";
import { AdminJobsTable } from "@/components/admin/AdminJobsTable";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { jobStatusLabels } from "@/lib/format";
import { firstParam, hrefWithQuery } from "@/lib/search";
import { serverApi } from "@/lib/server-api";
import type { ApiSuccess, Job, JobStatus, PaginationMeta } from "@/types/api";

const statuses: JobStatus[] = ["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"];

export default async function AdminJobsPage({ searchParams }: PageProps<"/admin/jobs">) {
  const params = await searchParams;
  const search = firstParam(params.search);
  const status = firstParam(params.status);
  const page = Number(firstParam(params.page) ?? 1);

  const result = await serverApi<ApiSuccess<Job[]> & { pagination?: PaginationMeta }>("/admin/jobs", {
    auth: true,
    query: { page, limit: 12, search, status },
  }).catch(() => ({ data: [] as Job[], pagination: undefined }));

  const jobs = result.data ?? [];

  return (
    <div>
      <DashHeader title="Jobs" text="Remove listings that should not stay on the platform." />
      <FilterBar action="/admin/jobs" columns={3}>
        <FilterInput label="Search" name="search" defaultValue={search} placeholder="Title or company" />
        <FilterSelect
          label="Status"
          name="status"
          defaultValue={status}
          options={[
            { value: "", label: "All statuses" },
            ...statuses.map((value) => ({ value, label: jobStatusLabels[value] })),
          ]}
        />
      </FilterBar>
      {jobs.length === 0 ? (
        <div className="rounded-xl border border-line bg-card p-6">
          <EmptyState title="No jobs found" text="Try a different search." />
        </div>
      ) : (
        <AdminJobsTable items={jobs} />
      )}
      <Pagination
        meta={result.pagination}
        previousHref={hrefWithQuery("/admin/jobs", params, { page: (result.pagination?.currentPage ?? 1) - 1 })}
        nextHref={hrefWithQuery("/admin/jobs", params, { page: (result.pagination?.currentPage ?? 1) + 1 })}
      />
    </div>
  );
}
