import { DashboardFrame } from "@/components/layout/DashboardFrame";

export default function SeekerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardFrame role="JOB_SEEKER">{children}</DashboardFrame>;
}
