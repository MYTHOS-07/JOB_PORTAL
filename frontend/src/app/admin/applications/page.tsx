import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { FilterBar, FilterInput, FilterSelect } from "@/components/common/FilterBar";
import { Pagination } from "@/components/common/Pagination";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { applicationStatusLabels, formatDate } from "@/lib/format";
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

export default async function AdminApplicationsPage({ searchParams }: PageProps<"/admin/applications">) {
  const params = await searchParams;
  const search = firstParam(params.search);
  const status = firstParam(params.status);
  const page = Number(firstParam(params.page) ?? 1);

  const result = await serverApi<ApiSuccess<Application[]> & { pagination?: PaginationMeta }>(
    "/admin/applications",
    { auth: true, query: { page, limit: 12, search, status } },
  ).catch(() => ({ data: [] as Application[], pagination: undefined }));

  const items = result.data ?? [];

  return (
    <div>
      <DashHeader title="Applications" text="All applications submitted across the platform." />
      <FilterBar action="/admin/applications" columns={3}>
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
      </FilterBar>
      {items.length === 0 ? (
        <div className="rounded-xl border border-line bg-card p-6">
          <EmptyState title="No applications" text="Nothing matches these filters." />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="bg-background text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Candidate</th>
                <th className="px-4 py-3 font-medium">Job</th>
                <th className="w-32 px-4 py-3 font-medium">Applied</th>
                <th className="w-32 px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((application) => (
                <tr key={application.id} className="h-16 border-t border-line">
                  <td className="truncate px-4">
                    <p className="font-medium">{application.applicant?.name}</p>
                    <p className="truncate text-xs text-muted">{application.applicant?.email}</p>
                  </td>
                  <td className="truncate px-4 text-muted">{application.job?.title}</td>
                  <td className="px-4 text-muted">{formatDate(application.appliedAt)}</td>
                  <td className="px-4">
                    <Badge muted>{applicationStatusLabels[application.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        meta={result.pagination}
        previousHref={hrefWithQuery("/admin/applications", params, { page: (result.pagination?.currentPage ?? 1) - 1 })}
        nextHref={hrefWithQuery("/admin/applications", params, { page: (result.pagination?.currentPage ?? 1) + 1 })}
      />
    </div>
  );
}
