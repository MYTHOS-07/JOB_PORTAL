"use client";

import { useState } from "react";
import { dashSelectClass, dashSelectStyle } from "@/components/common/Field";
import { applicationStatusLabels } from "@/lib/format";
import { applicationService } from "@/services/application.service";
import type { Application, ApplicationStatus } from "@/types/api";

const statuses: ApplicationStatus[] = [
  "PENDING",
  "REVIEWING",
  "SHORTLISTED",
  "INTERVIEW",
  "REJECTED",
  "ACCEPTED",
];

export function EmployerApplicantsTable({ items }: { items: Application[] }) {
  const [rows, setRows] = useState(items);

  async function updateStatus(id: number, status: ApplicationStatus) {
    await applicationService.updateStatus(id, status);
    setRows((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-background text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Candidate</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="w-44 px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((application) => (
            <tr key={application.id} className="h-16 border-t border-line">
              <td className="truncate px-4">
                <p className="font-medium">{application.applicant?.name}</p>
                <p className="truncate text-xs text-muted">{application.applicant?.email}</p>
              </td>
              <td className="truncate px-4 text-muted">{application.job?.title}</td>
              <td className="px-4">
                <select
                  className={dashSelectClass}
                  style={dashSelectStyle}
                  value={application.status}
                  onChange={(event) => void updateStatus(application.id, event.target.value as ApplicationStatus)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {applicationStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
