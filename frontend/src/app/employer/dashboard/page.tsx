import Link from "next/link";
import { Alert } from "@/components/common/Alert";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Panel } from "@/components/dashboard/Panel";
import { applicationStatusLabels, formatDate, jobStatusLabels } from "@/lib/format";
import { serverApiSafe } from "@/lib/server-api";
import type { ApiSuccess, EmployerDashboard, Job, PaginationMeta } from "@/types/api";

export default async function EmployerDashboardPage() {
  const [dashboard, jobList] = await Promise.all([
    serverApiSafe<ApiSuccess<EmployerDashboard>>("/dashboard/employer", { auth: true }),
    serverApiSafe<ApiSuccess<Job[]> & { pagination?: PaginationMeta }>("/jobs/my-jobs", {
      auth: true,
      query: { limit: 8 },
    }),
  ]);

  const data = dashboard?.data;
  const jobs = jobList?.data ?? [];
  const totals = data?.totals ?? {};
  const applications = data?.recentApplications ?? [];

  return (
    <div>
      <DashHeader
        title={data?.company?.companyName ?? "Hiring workspace"}
        text="Pipeline health, live jobs, and the latest applicants."
        action={
          <Link
            href="/employer/jobs/create"
            className="inline-flex h-9 items-center rounded-md bg-ink px-3 text-sm font-medium text-white"
          >
            Post a job
          </Link>
        }
      />
      {!data ? (
        <div className="mb-4">
          <Alert>Could not load hiring data. Create a company profile if you have not set one up yet.</Alert>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Jobs" value={totals.jobs ?? 0} />
        <KpiCard label="Published" value={totals.activeJobs ?? 0} hint="Visible to seekers" />
        <KpiCard label="Closed" value={totals.closedJobs ?? 0} />
        <KpiCard label="Applicants" value={totals.applicants ?? 0} />
        <KpiCard label="Pending review" value={totals.pendingApplications ?? 0} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Latest applicants" actionHref="/employer/applicants">
          {applications.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No applicants yet" text="When seekers apply, they will show up in this feed." />
            </div>
          ) : (
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-background text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Candidate</th>
                  <th className="px-4 py-2 font-medium">Role</th>
                  <th className="w-28 px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id} className="border-t border-line">
                    <td className="truncate px-4 py-3">
                      <p className="font-medium text-ink">{application.applicant?.name}</p>
                      <p className="text-xs text-muted">{formatDate(application.appliedAt)}</p>
                    </td>
                    <td className="truncate px-4 py-3 text-muted">{application.job?.title}</td>
                    <td className="px-4 py-3">
                      <Badge muted>{applicationStatusLabels[application.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel title="Your jobs" actionHref="/employer/jobs">
          {jobs.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No jobs yet" text="Publish a role to start receiving applications." />
            </div>
          ) : (
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-background text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="w-28 px-4 py-2 font-medium">Status</th>
                  <th className="w-24 px-4 py-2 font-medium">Apps</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-t border-line">
                    <td className="truncate px-4 py-3">
                      <Link href={`/employer/jobs/${job.id}/edit`} className="font-medium text-ink hover:underline">
                        {job.title}
                      </Link>
                      <p className="text-xs text-muted">{job.location}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge muted>{jobStatusLabels[job.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted">{job._count?.applications ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>
    </div>
  );
}
