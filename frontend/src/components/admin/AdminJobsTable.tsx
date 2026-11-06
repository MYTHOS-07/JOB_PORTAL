"use client";

import { useState } from "react";
import { Badge } from "@/components/common/Badge";
import { jobStatusLabels } from "@/lib/format";
import { adminService } from "@/services/admin.service";
import type { Job } from "@/types/api";

export function AdminJobsTable({ items }: { items: Job[] }) {
  const [jobs, setJobs] = useState(items);

  async function remove(id: number) {
    await adminService.deleteJob(id);
    setJobs((current) => current.filter((job) => job.id !== id));
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-background text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="w-48 px-4 py-3 font-medium">Company</th>
            <th className="w-32 px-4 py-3 font-medium">Status</th>
            <th className="w-24 px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="h-16 border-t border-line">
              <td className="truncate px-4 font-medium">{job.title}</td>
              <td className="truncate px-4 text-muted">{job.company?.companyName}</td>
              <td className="px-4">
                <Badge muted>{jobStatusLabels[job.status]}</Badge>
              </td>
              <td className="px-4">
                <button
                  type="button"
                  onClick={() => void remove(job.id)}
                  className="text-xs font-medium text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
