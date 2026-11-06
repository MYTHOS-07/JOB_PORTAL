import { EmptyState } from "@/components/common/EmptyState";
import { FilterBar, FilterInput, FilterSelect } from "@/components/common/FilterBar";
import { Pagination } from "@/components/common/Pagination";
import { EmployerApplicantsTable } from "@/components/applications/EmployerApplicantsTable";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { applicationStatusLabels } from "@/lib/format";
import { firstParam, hrefWithQuery } from "@/lib/search";
import { serverApi } from "@/lib/server-api";
import type { ApiSuccess, Application, ApplicationStatus, PaginationMeta } from "@/types/api";

const statuses: ApplicationStatus[] = [
  "PENDING",
  "REVIEWING",
  "SHORTLISTED",
  "INTERVIEW",
  "REJECTED",
  "ACCEPTED",
  "WITHDRAWN",
];

export default async function ApplicantsPage({ searchParams }: PageProps<"/employer/applicants">) {
  const params = await searchParams;
  const search = firstParam(params.search);
  const status = firstParam(params.status);
  const jobId = firstParam(params.jobId);
  const page = Number(firstParam(params.page) ?? 1);

  const result = await serverApi<ApiSuccess<Application[]> & { pagination?: PaginationMeta }>(
    "/applications/employer",
    { auth: true, query: { page, limit: 10, search, status, jobId } },
  ).catch(() => ({ data: [] as Application[], pagination: undefined }));

  const items = result.data ?? [];

  return (
    <div>
      <DashHeader title="Applicants" text="Review candidates and update pipeline status." />
      <FilterBar action="/employer/applicants">
        <FilterInput label="Search" name="search" defaultValue={search} placeholder="Candidate or job" />
        <FilterSelect
          label="Status"
          name="status"
          defaultValue={status}
          options={[
            { value: "", label: "All statuses" },
            ...statuses.map((value) => ({ value, label: applicationStatusLabels[value] })),
          ]}
        />
        {jobId ? <input type="hidden" name="jobId" value={jobId} /> : null}
      </FilterBar>
      {items.length === 0 ? (
        <div className="rounded-xl border border-line bg-card p-6">
          <EmptyState title="No applicants yet" text="Applications to your jobs will appear here." />
        </div>
      ) : (
        <EmployerApplicantsTable items={items} />
      )}
      <Pagination
        meta={result.pagination}
        previousHref={hrefWithQuery("/employer/applicants", params, { page: (result.pagination?.currentPage ?? 1) - 1 })}
        nextHref={hrefWithQuery("/employer/applicants", params, { page: (result.pagination?.currentPage ?? 1) + 1 })}
      />
    </div>
  );
}
