import { DashboardFrame } from "@/components/layout/DashboardFrame";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardFrame role="ADMIN">{children}</DashboardFrame>;
}
