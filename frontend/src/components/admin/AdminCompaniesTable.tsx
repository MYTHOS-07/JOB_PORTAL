"use client";

import { useState } from "react";
import { dashSelectClass, dashSelectStyle } from "@/components/common/Field";
import { adminService } from "@/services/admin.service";
import type { Company, CompanyStatus } from "@/types/api";

const statuses: CompanyStatus[] = ["PENDING", "APPROVED", "SUSPENDED"];

export function AdminCompaniesTable({ items }: { items: Company[] }) {
  const [companies, setCompanies] = useState(items);

  async function changeStatus(company: Company, status: CompanyStatus) {
    await adminService.updateCompanyStatus(company.id, status);
    setCompanies((current) =>
      current.map((item) => (item.id === company.id ? { ...item, status } : item)),
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-background text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Company</th>
            <th className="w-40 px-4 py-3 font-medium">Industry</th>
            <th className="w-36 px-4 py-3 font-medium">Location</th>
            <th className="w-40 px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id} className="h-16 border-t border-line">
              <td className="truncate px-4">
                <p className="font-medium">{company.companyName}</p>
                <p className="truncate text-xs text-muted">{company.website}</p>
              </td>
              <td className="px-4 text-muted">{company.industry ?? "—"}</td>
              <td className="px-4 text-muted">{company.location ?? "—"}</td>
              <td className="px-4">
                <select
                  className={dashSelectClass}
                  style={dashSelectStyle}
                  value={company.status}
                  onChange={(event) => void changeStatus(company, event.target.value as CompanyStatus)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
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
