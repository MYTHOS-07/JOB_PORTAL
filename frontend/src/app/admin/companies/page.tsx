import { EmptyState } from "@/components/common/EmptyState";
import { FilterBar, FilterInput, FilterSelect } from "@/components/common/FilterBar";
import { Pagination } from "@/components/common/Pagination";
import { AdminCompaniesTable } from "@/components/admin/AdminCompaniesTable";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { firstParam, hrefWithQuery } from "@/lib/search";
import { serverApi } from "@/lib/server-api";
import type { ApiSuccess, Company, CompanyStatus, PaginationMeta } from "@/types/api";

const statuses: CompanyStatus[] = ["PENDING", "APPROVED", "SUSPENDED"];

export default async function AdminCompaniesPage({ searchParams }: PageProps<"/admin/companies">) {
  const params = await searchParams;
  const search = firstParam(params.search);
  const status = firstParam(params.status);
  const industry = firstParam(params.industry);
  const page = Number(firstParam(params.page) ?? 1);

  const result = await serverApi<ApiSuccess<Company[]> & { pagination?: PaginationMeta }>("/admin/companies", {
    auth: true,
    query: { page, limit: 12, search, status, industry },
  }).catch(() => ({ data: [] as Company[], pagination: undefined }));

  const companies = result.data ?? [];

  return (
    <div>
      <DashHeader title="Companies" text="Approve, suspend, or review employer profiles." />
      <FilterBar action="/admin/companies">
        <FilterInput label="Search" name="search" defaultValue={search} placeholder="Company name" />
        <FilterInput label="Industry" name="industry" defaultValue={industry} placeholder="Technology" />
        <FilterSelect
          label="Status"
          name="status"
          defaultValue={status}
          options={[
            { value: "", label: "All statuses" },
            ...statuses.map((value) => ({ value, label: value })),
          ]}
        />
      </FilterBar>
      {companies.length === 0 ? (
        <div className="rounded-xl border border-line bg-card p-6">
          <EmptyState title="No companies found" text="Try a different search." />
        </div>
      ) : (
        <AdminCompaniesTable items={companies} />
      )}
      <Pagination
        meta={result.pagination}
        previousHref={hrefWithQuery("/admin/companies", params, { page: (result.pagination?.currentPage ?? 1) - 1 })}
        nextHref={hrefWithQuery("/admin/companies", params, { page: (result.pagination?.currentPage ?? 1) + 1 })}
      />
    </div>
  );
}
