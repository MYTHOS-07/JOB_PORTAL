"use client";

import { AuthGuard, Sidebar, Topbar } from "@/components/layout/AppShell";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import type { Role } from "@/types/api";

export function DashboardFrame({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background text-ink">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <SmoothScroll className="relative min-h-0 flex-1 overflow-y-auto">
          <main className="relative p-6">
            <AuthGuard roles={[role]} />
            {children}
          </main>
        </SmoothScroll>
      </div>
    </div>
  );
}
