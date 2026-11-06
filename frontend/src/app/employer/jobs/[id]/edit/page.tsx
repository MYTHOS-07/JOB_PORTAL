import Link from "next/link";
import { Alert } from "@/components/common/Alert";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { JobForm } from "@/components/forms/JobForm";
import { serverApiSafe } from "@/lib/server-api";
import type { ApiSuccess, Job, JobCategory, JobStatus } from "@/types/api";

export default async function EditJobPage({ params }: PageProps<"/employer/jobs/[id]/edit">) {
  const { id } = await params;
  const [jobResult, categoriesResult, statsResult] = await Promise.all([
    serverApiSafe<ApiSuccess<Job>>(`/jobs/${id}`, { auth: true }),
    serverApiSafe<ApiSuccess<JobCategory[]>>("/categories"),
    serverApiSafe<
      ApiSuccess<{ jobId: number; title: string; status: JobStatus; totalApplications: number }>
    >(`/jobs/${id}/statistics`, { auth: true }),
  ]);

  const job = jobResult?.data;
  if (!job) {
    return <Alert>This job could not be loaded.</Alert>;
  }

  return (
    <div>
      <DashHeader
        title="Edit job"
        text="Update the listing and keep applicants in the loop."
        action={
          <Link
            href={`/employer/applicants?jobId=${job.id}`}
            className="inline-flex h-9 items-center rounded-md border border-line px-3 text-sm"
          >
            {statsResult?.data.totalApplications ?? job._count?.applications ?? 0} applicants
          </Link>
        }
      />
      <JobForm job={job} categories={categoriesResult?.data ?? []} />
    </div>
  );
}
