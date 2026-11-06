import { Link } from "next-view-transitions";
import { EmptyState } from "@/components/common/EmptyState";
import { FilterBar, FilterInput } from "@/components/common/FilterBar";
import { Pagination } from "@/components/common/Pagination";
import { PageHeader } from "@/components/layout/PageHeader";
import { firstParam, hrefWithQuery } from "@/lib/search";
import { serverApi } from "@/lib/server-api";
import type { ApiSuccess, Company, PaginationMeta } from "@/types/api";

export default async function CompaniesPage({ searchParams }: PageProps<"/companies">) {
  const params = await searchParams;
  const search = firstParam(params.search);
  const location = firstParam(params.location);
  const industry = firstParam(params.industry);
  const page = Number(firstParam(params.page) ?? 1);

  const result = await serverApi<ApiSuccess<Company[]> & { pagination: PaginationMeta }>("/companies", {
    query: { page, limit: 12, search, location, industry },
  }).catch(() => ({ data: [] as Company[], pagination: undefined }));

  const companies = result.data ?? [];

  return (
    <div>
      <PageHeader title="Companies" text="Employers hiring through Elevate Workforce." />
      <FilterBar action="/companies">
        <FilterInput label="Company" name="search" defaultValue={search} placeholder="Company name" />
        <FilterInput label="Location" name="location" defaultValue={location} placeholder="Lalitpur" />
        <FilterInput label="Industry" name="industry" defaultValue={industry} placeholder="Technology" />
      </FilterBar>
      {companies.length === 0 ? (
        <EmptyState title="No companies found" text="Try another name, city, or industry." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.id}`}
              className="rounded-2xl border border-line bg-card p-5 transition hover:border-accent/40"
            >
              <h2 className="text-lg font-semibold">{company.companyName}</h2>
              <p className="mt-1 text-sm text-muted">
                {company.industry ?? "Company"} · {company.location ?? "Nepal"}
              </p>
              <p className="mt-3 line-clamp-2 text-sm text-muted">{company.description}</p>
            </Link>
          ))}
        </div>
      )}
      <Pagination
        meta={result.pagination}
        previousHref={hrefWithQuery("/companies", params, { page: (result.pagination?.currentPage ?? 1) - 1 })}
        nextHref={hrefWithQuery("/companies", params, { page: (result.pagination?.currentPage ?? 1) + 1 })}
        smooth
      />
    </div>
  );
}
