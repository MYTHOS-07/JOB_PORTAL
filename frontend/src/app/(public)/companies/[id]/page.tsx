import { EmptyState } from "@/components/common/EmptyState";
import { JobCard } from "@/components/jobs/JobCard";
import { serverApi } from "@/lib/server-api";
import type { ApiSuccess, Company, Job, PaginationMeta } from "@/types/api";

export default async function CompanyDetailPage({ params }: PageProps<"/companies/[id]">) {
  const { id } = await params;

  const [companyResult, jobsResult] = await Promise.all([
    serverApi<ApiSuccess<Company>>(`/companies/${id}`).catch(() => null),
    serverApi<ApiSuccess<Job[]> & { pagination?: PaginationMeta }>(`/companies/${id}/jobs`, {
      query: { page: 1, limit: 10 },
    }).catch(() => ({ data: [] as Job[] })),
  ]);

  const company = companyResult?.data;
  if (!company) {
    return <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">Company not found.</p>;
  }

  const jobs = jobsResult.data ?? [];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-line bg-card p-8">
        <h1 className="text-3xl font-semibold tracking-tight">{company.companyName}</h1>
        <p className="mt-2 text-muted">
          {company.industry ?? "Company"} · {company.location ?? "Nepal"}
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{company.description}</p>
      </section>
      <section>
        <h2 className="mb-4 text-xl font-semibold">Open roles</h2>
        {jobs.length === 0 ? (
          <EmptyState title="No published jobs" text="This employer has no live listings right now." />
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
