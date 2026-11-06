import { Link } from "next-view-transitions";
import { Alert } from "@/components/common/Alert";
import { Badge } from "@/components/common/Badge";
import { JobApplyPanel } from "@/components/jobs/JobApplyPanel";
import { employmentLabels, experienceLabels, formatDate, formatSalary } from "@/lib/format";
import { serverApiSafe } from "@/lib/server-api";
import type { ApiSuccess, Job } from "@/types/api";

export default async function JobDetailPage({ params }: PageProps<"/jobs/[id]">) {
  const { id } = await params;
  const result = await serverApiSafe<ApiSuccess<Job>>(`/jobs/${id}`);
  const job = result?.data;

  if (!job) {
    return <Alert>This job could not be found.</Alert>;
  }

  return (
    <article className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="rounded-2xl border border-line bg-card p-8">
        <p className="text-sm text-muted">{job.company?.companyName}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{job.title}</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge muted>{employmentLabels[job.employmentType]}</Badge>
          <Badge muted>{experienceLabels[job.experienceLevel]}</Badge>
          <Badge muted>{job.location}</Badge>
        </div>
        <p className="mt-6 whitespace-pre-wrap leading-7 text-muted">{job.description}</p>
      </div>
      <aside className="h-fit space-y-4 rounded-2xl border border-line bg-card p-6">
        <p className="text-lg font-semibold">{formatSalary(job.salaryMin, job.salaryMax)}</p>
        <p className="text-sm text-muted">Deadline {formatDate(job.applicationDeadline)}</p>
        {job.company ? (
          <Link href={`/companies/${job.company.id}`} className="block text-sm underline">
            View company
          </Link>
        ) : null}
        <JobApplyPanel jobId={job.id} />
      </aside>
    </article>
  );
}
