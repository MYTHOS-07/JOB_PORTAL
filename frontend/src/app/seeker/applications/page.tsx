import { EmptyState } from "@/components/common/EmptyState";
import { FilterBar, FilterInput, FilterSelect } from "@/components/common/FilterBar";
import { Pagination } from "@/components/common/Pagination";
import { SeekerApplicationTable } from "@/components/applications/SeekerApplicationTable";
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

export default async function MyApplicationsPage({ searchParams }: PageProps<"/seeker/applications">) {
  const params = await searchParams;
  const search = firstParam(params.search);
  const status = firstParam(params.status);
  const page = Number(firstParam(params.page) ?? 1);

  const result = await serverApi<ApiSuccess<Application[]> & { pagination?: PaginationMeta }>(
    "/applications/my-applications",
    { auth: true, query: { page, limit: 10, search, status } },
  ).catch(() => ({ data: [] as Application[], pagination: undefined }));

  const items = result.data ?? [];

  return (
    <div>
      <DashHeader title="My applications" text="Track every role you have applied for." />
      <FilterBar action="/seeker/applications" columns={3}>
        <FilterInput label="Search" name="search" defaultValue={search} placeholder="Job or company" />
        <FilterSelect
          label="Status"
          name="status"
          defaultValue={status}
          options={[
            { value: "", label: "All statuses" },
            ...statuses.map((value) => ({ value, label: applicationStatusLabels[value] })),
          ]}
        />
      </FilterBar>
      {items.length === 0 ? (
        <div className="rounded-xl border border-line bg-card p-6">
          <EmptyState title="No applications yet" text="Browse jobs and apply, or adjust your filters." />
        </div>
      ) : (
        <SeekerApplicationTable items={items} />
      )}
      <Pagination
        meta={result.pagination}
        previousHref={hrefWithQuery("/seeker/applications", params, { page: (result.pagination?.currentPage ?? 1) - 1 })}
        nextHref={hrefWithQuery("/seeker/applications", params, { page: (result.pagination?.currentPage ?? 1) + 1 })}
      />
    </div>
  );
}
