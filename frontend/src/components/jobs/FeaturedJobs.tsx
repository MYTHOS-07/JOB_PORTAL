import { Link } from "next-view-transitions";
import { EmptyState } from "@/components/common/EmptyState";
import { JobCard } from "@/components/jobs/JobCard";
import { serverApi } from "@/lib/server-api";
import type { ApiSuccess, Job, PaginationMeta } from "@/types/api";

export async function FeaturedJobs() {
  const result = await serverApi<ApiSuccess<Job[]> & { pagination: PaginationMeta }>("/jobs", {
    query: { page: 1, limit: 6 },
  }).catch(() => ({ data: [] as Job[] }));
  const jobs = result.data ?? [];

  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Latest roles</h2>
          <p className="mt-1 text-sm text-muted">Recently published opportunities.</p>
        </div>
        <Link href="/jobs" className="text-sm font-medium text-ink hover:text-accent">
          View all
        </Link>
      </div>
      {jobs.length === 0 ? (
        <EmptyState title="No jobs yet" text="Published roles will appear here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}
