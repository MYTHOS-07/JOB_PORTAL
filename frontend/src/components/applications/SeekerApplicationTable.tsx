"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/common/Badge";
import { applicationStatusLabels, formatDate } from "@/lib/format";
import { applicationService } from "@/services/application.service";
import type { Application } from "@/types/api";

export function SeekerApplicationTable({ items }: { items: Application[] }) {
  const [rows, setRows] = useState(items);

  async function withdraw(id: number) {
    await applicationService.withdraw(id);
    setRows((current) =>
      current.map((item) => (item.id === id ? { ...item, status: "WITHDRAWN" } : item)),
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-background text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="w-32 px-4 py-3 font-medium">Applied</th>
            <th className="w-32 px-4 py-3 font-medium">Status</th>
            <th className="w-28 px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {rows.map((application) => (
            <tr key={application.id} className="h-16 border-t border-line">
              <td className="truncate px-4">
                <Link href={`/jobs/${application.jobId}`} className="font-medium hover:underline">
                  {application.job?.title ?? `Job #${application.jobId}`}
                </Link>
                <p className="truncate text-xs text-muted">{application.job?.company?.companyName}</p>
              </td>
              <td className="px-4 text-muted">{formatDate(application.appliedAt)}</td>
              <td className="px-4">
                <Badge muted>{applicationStatusLabels[application.status]}</Badge>
              </td>
              <td className="px-4">
                {application.status !== "WITHDRAWN" && application.status !== "ACCEPTED" ? (
                  <button
                    type="button"
                    className="text-xs text-muted hover:underline"
                    onClick={() => void withdraw(application.id)}
                  >
                    Withdraw
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
