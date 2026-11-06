"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dashSelectClass, dashSelectStyle } from "@/components/common/Field";
import { jobStatusLabels } from "@/lib/format";
import { jobService } from "@/services/job.service";
import type { Job, JobStatus } from "@/types/api";

export function EmployerJobsTable({ items }: { items: Job[] }) {
  const router = useRouter();
  const [jobs, setJobs] = useState(items);

  async function remove(id: number) {
    await jobService.remove(id);
    setJobs((current) => current.filter((job) => job.id !== id));
    router.refresh();
  }

  async function changeStatus(id: number, status: JobStatus) {
    await jobService.changeStatus(id, status);
    setJobs((current) => current.map((job) => (job.id === id ? { ...job, status } : job)));
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-background text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="w-40 px-4 py-3 font-medium">Status</th>
            <th className="w-24 px-4 py-3 font-medium">Apps</th>
            <th className="w-56 px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="h-16 border-t border-line">
              <td className="truncate px-4">
                <p className="font-medium">{job.title}</p>
                <p className="text-xs text-muted">{job.location}</p>
              </td>
              <td className="px-4">
                <select
                  className={dashSelectClass}
                  style={dashSelectStyle}
                  value={job.status}
                  onChange={(event) => void changeStatus(job.id, event.target.value as JobStatus)}
                >
                  {(["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"] as JobStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {jobStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 tabular-nums">{job._count?.applications ?? 0}</td>
              <td className="px-4 text-xs">
                <Link href={`/employer/jobs/${job.id}/edit`} className="mr-3 text-teal-700 hover:underline">
                  Edit
                </Link>
                <Link href={`/employer/applicants?jobId=${job.id}`} className="mr-3 hover:underline">
                  Applicants
                </Link>
                <button type="button" onClick={() => void remove(job.id)} className="text-rose-600 hover:underline">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
