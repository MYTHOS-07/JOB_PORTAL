import { DashHeader } from "@/components/dashboard/DashHeader";
import { JobForm } from "@/components/forms/JobForm";
import { serverApiSafe } from "@/lib/server-api";
import type { ApiSuccess, JobCategory } from "@/types/api";

export default async function CreateJobPage() {
  const categories = await serverApiSafe<ApiSuccess<JobCategory[]>>("/categories");

  return (
    <div>
      <DashHeader title="Create job" text="Publish a role for job seekers in Nepal." />
      <JobForm categories={categories?.data ?? []} />
    </div>
  );
}
