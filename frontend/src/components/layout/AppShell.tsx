"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserAvatar } from "@/components/common/UserAvatar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/context/AuthContext";
import { roleLabels } from "@/lib/format";
import type { Role } from "@/types/api";

const menus: Record<Role, { href: string; label: string }[]> = {
  JOB_SEEKER: [
    { href: "/seeker/dashboard", label: "Overview" },
    { href: "/seeker/applications", label: "Applications" },
    { href: "/seeker/profile", label: "Account" },
    { href: "/jobs", label: "Browse jobs" },
  ],
  EMPLOYER: [
    { href: "/employer/dashboard", label: "Overview" },
    { href: "/employer/jobs", label: "Jobs" },
    { href: "/employer/jobs/create", label: "Post a job" },
    { href: "/employer/applicants", label: "Applicants" },
    { href: "/employer/company", label: "Company" },
    { href: "/employer/account", label: "Account" },
  ],
  ADMIN: [
    { href: "/admin/dashboard", label: "Overview" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/companies", label: "Companies" },
    { href: "/admin/jobs", label: "Jobs" },
    { href: "/admin/applications", label: "Applications" },
    { href: "/admin/account", label: "Account" },
  ],
};

export function Sidebar({ role }: { role: Role }) {
  const links = menus[role];
  const pathname = usePathname();

  return (
    <aside className="flex w-[260px] shrink-0 flex-col bg-zinc-800 text-[#e8efe9]">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-white/10 px-5">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-zinc-800 text-xs font-bold text-white ring-1 ring-white/15">
          EW
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">Elevate Workforce</p>
          <p className="text-xs uppercase tracking-wide text-white/60">{roleLabels[role]}</p>
        </div>
      </div>
      <div className="border-b border-white/10 px-3 py-2">
        <Link
          href="/"
          className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <span aria-hidden className="text-base leading-none">←</span>
          Home
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex h-10 items-center rounded-lg px-3 text-sm transition ${
                active ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link href="/" className="flex h-9 items-center rounded-lg px-3 text-sm text-white/70 hover:bg-white/10 hover:text-white">
          Public site
        </Link>
      </div>
    </aside>
  );
}

export function Topbar() {
  const { user, loading, logout } = useAuth();

  async function onLogout() {
    await logout();
    window.location.assign("/");
  }

  return (
    <header className="relative z-50 flex h-16 shrink-0 items-center justify-between border-b border-line bg-card px-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">
          {loading ? "Loading workspace" : `Welcome back${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        </p>
        <p className="text-xs text-muted">Manage hiring activity from one place.</p>
      </div>
      <div className="flex h-9 min-w-[220px] items-center justify-end gap-3">
        {loading ? (
          <span className="h-9 w-40 animate-pulse rounded-full bg-line" />
        ) : (
          <>
            <NotificationBell
              accountHref={
                user?.role === "EMPLOYER"
                  ? "/employer/account"
                  : user?.role === "ADMIN"
                    ? "/admin/account"
                    : "/seeker/profile"
              }
            />
            {user ? (
              <div className="hidden items-center gap-2 sm:flex">
                <UserAvatar name={user.name} src={user.avatarUrl} size="sm" />
                <span className="max-w-[11rem] truncate text-sm text-ink">{user.name}</span>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => void onLogout()}
              className="h-9 rounded-md border border-line px-3 text-sm text-ink transition hover:border-accent hover:text-accent"
            >
              Log out
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export function AuthGuard({ roles }: { roles: Role[] }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!roles.includes(user.role)) {
      router.replace("/");
    }
  }, [loading, roles, router, user]);

  if (loading || !user || !roles.includes(user.role)) {
    return (
      <div className="absolute inset-0 z-10 space-y-4 bg-background p-6">
        <div className="h-8 w-56 animate-pulse rounded bg-line" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-xl bg-card" />
      </div>
    );
  }

  return null;
}
