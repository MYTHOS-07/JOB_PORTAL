"use client";

import { Link } from "next-view-transitions";
import { useAuth } from "@/context/AuthContext";
import { dashboardPath } from "@/lib/format";
import { UserAvatar } from "@/components/common/UserAvatar";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function Navbar() {
  const { user, loading, logout } = useAuth();

  async function onLogout() {
    await logout();
    window.location.assign("/");
  }

  const accountHref =
    user?.role === "EMPLOYER" ? "/employer/account" : user?.role === "ADMIN" ? "/admin/account" : "/seeker/profile";

  return (
    <header className="sticky top-0 z-20 h-14 border-b border-line/80 bg-[#fffcf7]/90 backdrop-blur">
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-800 text-xs font-bold text-white">
            EW
          </span>
          <span className="text-sm font-semibold tracking-tight text-ink">Elevate Workforce</span>
        </Link>
        <div className="hidden items-center gap-7 text-sm text-muted md:flex">
          <Link href="/jobs" className="hover:text-ink">
            Jobs
          </Link>
          <Link href="/companies" className="hover:text-ink">
            Companies
          </Link>
          {user ? (
            <>
              <Link href={dashboardPath(user.role)} className="hover:text-ink">
                Dashboard
              </Link>
              {user.role === "JOB_SEEKER" ? (
                <Link href="/seeker/applications" className="hover:text-ink">
                  Applications
                </Link>
              ) : null}
              {user.role === "EMPLOYER" ? (
                <Link href="/employer/jobs" className="hover:text-ink">
                  My jobs
                </Link>
              ) : null}
              {user.role === "ADMIN" ? (
                <Link href="/admin/users" className="hover:text-ink">
                  Users
                </Link>
              ) : null}
            </>
          ) : null}
        </div>
        <div className="flex h-9 min-w-[168px] items-center justify-end gap-3 text-sm">
          {loading ? (
            <span className="h-9 w-28 animate-pulse rounded-full bg-line/80" />
          ) : user ? (
            <>
              <NotificationBell accountHref={accountHref} />
              <div className="hidden items-center gap-2 sm:flex">
                <UserAvatar name={user.name} src={user.avatarUrl} size="sm" />
                <span className="max-w-[10rem] truncate text-muted">{user.name}</span>
              </div>
              <button
                type="button"
                onClick={() => void onLogout()}
                className="rounded-full border border-line px-3 py-1.5 text-ink hover:bg-card"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-ink">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-ink px-4 py-1.5 font-medium text-white hover:bg-accent"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
