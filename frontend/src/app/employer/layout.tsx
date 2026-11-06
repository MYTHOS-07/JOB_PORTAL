import { DashboardFrame } from "@/components/layout/DashboardFrame";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardFrame role="EMPLOYER">{children}</DashboardFrame>;
}
