import { EmptyState } from "@/components/common/EmptyState";
import { FilterBar, FilterInput, FilterSelect } from "@/components/common/FilterBar";
import { Pagination } from "@/components/common/Pagination";
import { JobCard } from "@/components/jobs/JobCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { firstParam, hrefWithQuery } from "@/lib/search";
import { serverApi } from "@/lib/server-api";
import type { ApiSuccess, EmploymentType, ExperienceLevel, Job, JobCategory, PaginationMeta } from "@/types/api";

const employmentOptions: { value: EmploymentType | ""; label: string }[] = [
  { value: "", label: "Any type" },
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "REMOTE", label: "Remote" },
];

const experienceOptions: { value: ExperienceLevel | ""; label: string }[] = [
  { value: "", label: "Any level" },
  { value: "ENTRY_LEVEL", label: "Entry" },
  { value: "MID_LEVEL", label: "Mid" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" },
];

export default async function JobsPage({ searchParams }: PageProps<"/jobs">) {
  const params = await searchParams;
  const search = firstParam(params.search);
  const location = firstParam(params.location);
  const employmentType = firstParam(params.employmentType);
  const experienceLevel = firstParam(params.experienceLevel);
  const category = firstParam(params.category);
  const page = Number(firstParam(params.page) ?? 1);

  const [jobsResult, categoriesResult] = await Promise.all([
    serverApi<ApiSuccess<Job[]> & { pagination: PaginationMeta }>("/jobs", {
      query: { page, limit: 10, search, location, employmentType, experienceLevel, category },
    }).catch(() => ({ data: [] as Job[], pagination: undefined })),
    serverApi<ApiSuccess<JobCategory[]>>("/categories").catch(() => ({ data: [] as JobCategory[] })),
  ]);

  const jobs = jobsResult.data ?? [];
  const categories = categoriesResult.data ?? [];

  return (
    <div>
      <PageHeader title="Jobs" text="Search published roles across Nepal." />
      <FilterBar action="/jobs">
        <FilterInput label="Keyword" name="search" defaultValue={search} placeholder="Developer or company" />
        <FilterInput label="Location" name="location" defaultValue={location} placeholder="Kathmandu" />
        <FilterSelect label="Type" name="employmentType" defaultValue={employmentType} options={employmentOptions} />
        <FilterSelect
          label="Experience"
          name="experienceLevel"
          defaultValue={experienceLevel}
          options={experienceOptions}
        />
        <FilterSelect
          label="Category"
          name="category"
          defaultValue={category}
          options={[
            { value: "", label: "Any category" },
            ...categories.map((item) => ({ value: item.name, label: item.name })),
          ]}
        />
      </FilterBar>
      {jobs.length === 0 ? (
        <EmptyState title="No matching jobs" text="Try a different keyword, location, or filter." />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
      <Pagination
        meta={jobsResult.pagination}
        previousHref={hrefWithQuery("/jobs", params, { page: (jobsResult.pagination?.currentPage ?? 1) - 1 })}
        nextHref={hrefWithQuery("/jobs", params, { page: (jobsResult.pagination?.currentPage ?? 1) + 1 })}
        smooth
      />
    </div>
  );
}
