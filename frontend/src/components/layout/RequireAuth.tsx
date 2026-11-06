"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types/api";

export function RequireAuth({
  roles,
  children,
}: {
  roles?: Role[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (roles && !roles.includes(user.role)) {
      router.replace("/");
    }
  }, [loading, roles, router, user]);

  if (loading || !user || (roles && !roles.includes(user.role))) {
    return (
      <div className="space-y-4">
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

  return <>{children}</>;
}
