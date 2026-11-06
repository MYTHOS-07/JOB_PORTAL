"use client";

import { useState } from "react";
import { Badge } from "@/components/common/Badge";
import { dashSelectClass, dashSelectStyle } from "@/components/common/Field";
import { formatDate, roleLabels } from "@/lib/format";
import { adminService } from "@/services/admin.service";
import type { Role, User } from "@/types/api";

const roles: Role[] = ["JOB_SEEKER", "EMPLOYER", "ADMIN"];

export function AdminUsersTable({
  items,
  currentUserId,
}: {
  items: User[];
  currentUserId?: number;
}) {
  const [users, setUsers] = useState(items);
  const [error, setError] = useState("");

  async function toggle(user: User) {
    const next = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await adminService.updateUserStatus(user.id, next);
    setUsers((current) =>
      current.map((item) =>
        item.id === user.id ? { ...item, status: next } : item,
      ),
    );
  }

  async function deactivate(user: User) {
    try {
      await adminService.deleteUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not deactivate user.",
      );
    }
  }

  async function changeRole(user: User, role: Role) {
    if (role === user.role) return;
    try {
      await adminService.updateUserRole(user.id, role);
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? { ...item, role } : item)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update role.");
    }
  }

  return (
    <>
      {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
      <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-background text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="w-36 px-4 py-3 font-medium">Role</th>
              <th className="w-28 px-4 py-3 font-medium">Status</th>
              <th className="w-28 px-4 py-3 font-medium">Joined</th>
              <th className="w-40 px-4 py-3 font-medium">Account</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="h-16 border-t border-line">
                <td className="truncate px-4">
                  <p className="font-medium text-ink">{user.name}</p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </td>
                <td className="px-4">
                  {user.id === currentUserId ? (
                    <Badge muted>{roleLabels[user.role]}</Badge>
                  ) : (
                    <select
                      className={dashSelectClass}
                      style={dashSelectStyle}
                      value={user.role}
                      onChange={(event) =>
                        void changeRole(user, event.target.value as Role)
                      }
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {roleLabels[role]}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-4">
                  <Badge muted>{user.status}</Badge>
                </td>
                <td className="px-4 text-muted">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4">
                  {user.role !== "ADMIN" && user.id !== currentUserId ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void toggle(user)}
                        className="text-xs font-medium text-teal-700 hover:underline"
                      >
                        {user.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void deactivate(user)}
                        className="text-xs font-medium text-rose-600 hover:underline"
                      >
                        Deactivate
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted">Protected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
