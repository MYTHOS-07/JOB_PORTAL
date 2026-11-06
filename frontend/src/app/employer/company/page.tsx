import { DashHeader } from "@/components/dashboard/DashHeader";
import { CompanyForm } from "@/components/forms/CompanyForm";
import { serverApiSafe } from "@/lib/server-api";
import type { ApiSuccess, Company } from "@/types/api";

export default async function EmployerCompanyPage() {
  const result = await serverApiSafe<ApiSuccess<Company>>("/companies/me", { auth: true });

  return (
    <div className="max-w-2xl">
      <DashHeader title="Company profile" text="One employer account owns one company." />
      <CompanyForm company={result?.data ?? null} />
    </div>
  );
}
