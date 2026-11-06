import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";
import { FilterBar, FilterInput, FilterSelect } from "@/components/common/FilterBar";
import { Pagination } from "@/components/common/Pagination";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { EmployerJobsTable } from "@/components/jobs/EmployerJobsTable";
import { jobStatusLabels } from "@/lib/format";
import { firstParam, hrefWithQuery } from "@/lib/search";
import { serverApi } from "@/lib/server-api";
import type { ApiSuccess, Job, JobStatus, PaginationMeta } from "@/types/api";

const statuses: JobStatus[] = ["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"];

export default async function EmployerJobsPage({ searchParams }: PageProps<"/employer/jobs">) {
  const params = await searchParams;
  const search = firstParam(params.search);
  const status = firstParam(params.status);
  const page = Number(firstParam(params.page) ?? 1);

  const result = await serverApi<ApiSuccess<Job[]> & { pagination?: PaginationMeta }>("/jobs/my-jobs", {
    auth: true,
    query: { page, limit: 12, search, status },
  }).catch(() => ({ data: [] as Job[], pagination: undefined }));

  const jobs = result.data ?? [];

  return (
    <div>
      <DashHeader
        title="My jobs"
        text="Create, publish, and close roles for your company."
        action={
          <Link href="/employer/jobs/create" className="inline-flex h-9 items-center rounded-md bg-ink px-3 text-sm text-white">
            New job
          </Link>
        }
      />
      <FilterBar action="/employer/jobs" columns={3}>
        <FilterInput label="Search" name="search" defaultValue={search} placeholder="Job title" />
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
          <EmptyState title="No jobs yet" text="Create a company profile, then publish your first role." />
        </div>
      ) : (
        <EmployerJobsTable items={jobs} />
      )}
      <Pagination
        meta={result.pagination}
        previousHref={hrefWithQuery("/employer/jobs", params, { page: (result.pagination?.currentPage ?? 1) - 1 })}
        nextHref={hrefWithQuery("/employer/jobs", params, { page: (result.pagination?.currentPage ?? 1) + 1 })}
      />
    </div>
  );
}
