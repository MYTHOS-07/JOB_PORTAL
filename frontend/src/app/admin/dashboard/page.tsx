import { Badge } from "@/components/common/Badge";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Panel } from "@/components/dashboard/Panel";
import { applicationStatusLabels, formatDate, jobStatusLabels, roleLabels } from "@/lib/format";
import { serverApiSafe } from "@/lib/server-api";
import type { AdminDashboard, ApiSuccess } from "@/types/api";

export default async function AdminDashboardPage() {
  const response = await serverApiSafe<ApiSuccess<AdminDashboard>>("/dashboard/admin", { auth: true });
  const data = response?.data ?? {
    totals: {},
    recentUsers: [],
    recentJobs: [],
    recentApplications: [],
  };
  const totals = data.totals ?? {};

  return (
    <div>
      <DashHeader title="Platform overview" text="Users, companies, jobs and applications across Elevate Workforce." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Users" value={totals.users ?? 0} hint={`${totals.admins ?? 0} admins`} />
        <KpiCard label="Job seekers" value={totals.seekers ?? 0} />
        <KpiCard label="Employers" value={totals.employers ?? 0} />
        <KpiCard label="Companies" value={totals.companies ?? 0} />
        <KpiCard label="Jobs" value={totals.jobs ?? 0} />
        <KpiCard label="Published" value={totals.publishedJobs ?? 0} hint="Visible listings" />
        <KpiCard label="Applications" value={totals.applications ?? 0} />
        <KpiCard
          label="Publish rate"
          value={totals.jobs ? `${Math.round(((totals.publishedJobs ?? 0) / totals.jobs) * 100)}%` : "0%"}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Recent users" actionHref="/admin/users">
          <UserRows users={data.recentUsers} />
        </Panel>
        <Panel title="Recent jobs" actionHref="/admin/jobs">
          <JobRows jobs={data.recentJobs} />
        </Panel>
        <Panel title="Recent applications" actionHref="/admin/applications">
          <AppRows applications={data.recentApplications} />
        </Panel>
      </div>
    </div>
  );
}

function UserRows({ users }: { users: AdminDashboard["recentUsers"] }) {
  if (users.length === 0) {
    return <p className="p-4 text-sm text-muted">No users yet.</p>;
  }
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id} className="flex h-14 items-center justify-between gap-3 border-t border-line px-4 first:border-t-0">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <Badge muted>{roleLabels[user.role]}</Badge>
        </li>
      ))}
    </ul>
  );
}

function JobRows({ jobs }: { jobs: AdminDashboard["recentJobs"] }) {
  if (jobs.length === 0) {
    return <p className="p-4 text-sm text-muted">No jobs yet.</p>;
  }
  return (
    <ul>
      {jobs.map((job) => (
        <li key={job.id} className="flex h-14 items-center justify-between gap-3 border-t border-line px-4 first:border-t-0">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{job.title}</p>
            <p className="truncate text-xs text-muted">{job.company?.companyName}</p>
          </div>
          <Badge muted>{jobStatusLabels[job.status]}</Badge>
        </li>
      ))}
    </ul>
  );
}

function AppRows({ applications }: { applications: AdminDashboard["recentApplications"] }) {
  if (applications.length === 0) {
    return <p className="p-4 text-sm text-muted">No applications yet.</p>;
  }
  return (
    <ul>
      {applications.map((application) => (
        <li key={application.id} className="flex h-14 items-center justify-between gap-3 border-t border-line px-4 first:border-t-0">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{application.applicant?.name}</p>
            <p className="truncate text-xs text-muted">
              {application.job?.title} · {formatDate(application.appliedAt)}
            </p>
          </div>
          <Badge muted>{applicationStatusLabels[application.status]}</Badge>
        </li>
      ))}
    </ul>
  );
}
