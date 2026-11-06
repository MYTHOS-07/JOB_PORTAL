import Link from "next/link";
import { Alert } from "@/components/common/Alert";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Panel } from "@/components/dashboard/Panel";
import { PipelineBar } from "@/components/dashboard/PipelineBar";
import { applicationStatusLabels, formatDate, formatSalary } from "@/lib/format";
import { serverApiSafe } from "@/lib/server-api";
import type { ApiSuccess, SeekerDashboard } from "@/types/api";

export default async function SeekerDashboardPage() {
  const response = await serverApiSafe<ApiSuccess<SeekerDashboard>>("/dashboard/seeker", { auth: true });
  const data = response?.data;
  const totals = data?.totals ?? {};
  const applications = data?.recentApplications ?? [];
  const jobs = data?.recommendedJobs ?? [];

  return (
    <div>
      <DashHeader
        title="Overview"
        text="Track applications and pick up roles that match your profile."
        action={
          <Link
            href="/jobs"
            className="inline-flex h-9 items-center rounded-md bg-ink px-3 text-sm font-medium text-white"
          >
            Find jobs
          </Link>
        }
      />
      {!data ? <Alert>Could not load dashboard data. Sign in again if this continues.</Alert> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Applications" value={totals.applications ?? 0} hint="All time" />
        <KpiCard label="Pending" value={totals.pending ?? 0} hint="Waiting on employer" />
        <KpiCard label="Interviews" value={totals.interview ?? 0} hint="Scheduled" />
        <KpiCard label="Offers" value={totals.accepted ?? 0} hint="Accepted" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Application pipeline">
          <PipelineBar
            segments={[
              { label: "Pending", value: totals.pending ?? 0 },
              { label: "Reviewing", value: totals.reviewing ?? 0 },
              { label: "Shortlisted", value: totals.shortlisted ?? 0 },
              { label: "Interview", value: totals.interview ?? 0 },
              { label: "Rejected", value: totals.rejected ?? 0 },
              { label: "Accepted", value: totals.accepted ?? 0 },
            ]}
          />
        </Panel>
        <Panel title="Recent applications" actionHref="/seeker/applications">
          {applications.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No applications yet" text="Apply from a job page to start tracking status here." />
            </div>
          ) : (
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-background text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Role</th>
                  <th className="w-28 px-4 py-2 font-medium">Date</th>
                  <th className="w-28 px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id} className="border-t border-line">
                    <td className="truncate px-4 py-3">
                      <Link href={`/jobs/${application.jobId}`} className="font-medium text-ink hover:underline">
                        {application.job?.title ?? `Job #${application.jobId}`}
                      </Link>
                      <p className="truncate text-xs text-muted">{application.job?.company?.companyName}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(application.appliedAt)}</td>
                    <td className="px-4 py-3">
                      <Badge muted>{applicationStatusLabels[application.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Open roles" actionHref="/jobs" actionLabel="Browse all">
          {jobs.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No published jobs" text="New roles will appear here once employers post them." />
            </div>
          ) : (
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-background text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="w-40 px-4 py-2 font-medium">Company</th>
                  <th className="w-36 px-4 py-2 font-medium">Location</th>
                  <th className="w-44 px-4 py-2 font-medium">Salary</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-t border-line">
                    <td className="truncate px-4 py-3">
                      <Link href={`/jobs/${job.id}`} className="font-medium text-ink hover:underline">
                        {job.title}
                      </Link>
                    </td>
                    <td className="truncate px-4 py-3 text-muted">{job.company?.companyName}</td>
                    <td className="truncate px-4 py-3 text-muted">{job.location}</td>
                    <td className="px-4 py-3 text-muted">{formatSalary(job.salaryMin, job.salaryMax)}</td>
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
