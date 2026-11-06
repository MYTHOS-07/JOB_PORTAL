"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/common/Alert";
import { Field, inputClass } from "@/components/common/Field";
import { UserAvatar } from "@/components/common/UserAvatar";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { PageFade } from "@/components/motion/PageFade";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { assetUrl, formatDate } from "@/lib/format";
import { authService, getErrorMessage } from "@/services/auth.service";
import { notificationService } from "@/services/notification.service";
import { userService } from "@/services/user.service";
import type { Notification } from "@/types/api";

export function AccountSettings({ showResume = false }: { showResume?: boolean }) {
  const { user, setUser, logout } = useAuth();
  const { flash } = useToast();
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    userService
      .me()
      .then((response) => setUser(response.data))
      .catch(() => undefined);
    notificationService
      .list()
      .then((response) => setNotifications(response.data))
      .catch(() => setNotifications([]));
    notificationService
      .unreadCount()
      .then((response) => setUnread(response.data.unreadCount))
      .catch(() => setUnread(0));
  }, [setUser]);

  async function onProfile(formData: FormData) {
    setError("");
    try {
      const response = await userService.updateMe({
        name: formData.get("name"),
        phone: formData.get("phone"),
        location: formData.get("location"),
        bio: formData.get("bio"),
      });
      setUser(response.data);
      flash(response.message || "Profile saved.");
    } catch (err) {
      setError(getErrorMessage(err));
      flash(getErrorMessage(err), "error");
    }
  }

  async function onAvatar(file?: File) {
    if (!file) return;
    try {
      const response = await userService.uploadAvatar(file);
      setUser(response.data);
      flash("Photo updated.");
    } catch (err) {
      flash(getErrorMessage(err), "error");
    }
  }

  async function onResume(file?: File) {
    if (!file) return;
    try {
      const response = await userService.uploadResume(file);
      setUser(response.data);
      flash("Resume uploaded.");
    } catch (err) {
      flash(getErrorMessage(err), "error");
    }
  }

  async function onPassword(formData: FormData) {
    setError("");
    try {
      await authService.changePassword(
        String(formData.get("currentPassword")),
        String(formData.get("newPassword")),
        String(formData.get("confirmPassword")),
      );
      flash("Password changed. Please log in again.");
      await logout();
      window.location.assign("/login");
    } catch (err) {
      setError(getErrorMessage(err));
      flash(getErrorMessage(err), "error");
    }
  }

  async function onDelete(formData: FormData) {
    setError("");
    try {
      await userService.deleteMe(String(formData.get("password")));
      flash("Account deleted.");
      window.location.assign("/");
    } catch (err) {
      flash(getErrorMessage(err), "error");
    }
  }

  async function readAll() {
    await notificationService.markAllRead();
    setUnread(0);
    const response = await notificationService.list();
    setNotifications(response.data);
    flash("Notifications marked as read.");
  }

  async function removeNote(id: number) {
    await notificationService.remove(id);
    setNotifications((items) => items.filter((item) => item.id !== id));
  }

  if (!user) return null;

  return (
    <PageFade>
      <DashHeader
        title="Account"
        text="Edit your profile, photo, password and notifications."
        action={
          <div className="flex items-center gap-3">
            <UserAvatar name={user.name} src={user.avatarUrl} size="lg" />
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
        }
      />
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}
      <div className="grid gap-6 xl:grid-cols-2">
        <form action={(formData) => void onProfile(formData)} className="space-y-4 rounded-xl border border-line bg-card p-6 shadow-sm">
          <p className="text-sm font-semibold text-ink">Profile</p>
          <div className="flex items-center gap-4">
            <UserAvatar name={user.name} src={user.avatarUrl} size="lg" />
            <div>
              <p className="text-sm font-medium text-ink">{user.name}</p>
              <label className="text-sm text-accent">
                Change photo
                <input type="file" accept="image/*" className="hidden" onChange={(event) => void onAvatar(event.target.files?.[0])} />
              </label>
            </div>
          </div>
          <Field label="Name">
            <input name="name" defaultValue={user.name} className={inputClass} />
          </Field>
          <Field label="Phone">
            <input name="phone" defaultValue={user.profile?.phone ?? ""} className={inputClass} />
          </Field>
          <Field label="Location">
            <input name="location" defaultValue={user.profile?.location ?? ""} className={inputClass} />
          </Field>
          <Field label="Bio">
            <textarea name="bio" defaultValue={user.profile?.bio ?? ""} rows={4} className={inputClass} />
          </Field>
          <button type="submit" className="rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent">
            Save profile
          </button>
        </form>

        <div className="space-y-6">
          {showResume ? (
            <div className="rounded-xl border border-line bg-card p-6 shadow-sm">
              <p className="text-sm font-semibold text-ink">Resume</p>
              <p className="mt-1 text-sm text-muted">PDF, max 5 MB.</p>
              {user.profile?.resumeUrl ? (
                <a href={assetUrl(user.profile.resumeUrl) ?? "#"} className="mt-2 inline-block text-sm text-accent underline">
                  View current resume
                </a>
              ) : null}
              <input type="file" accept="application/pdf" className="mt-3 text-sm" onChange={(event) => void onResume(event.target.files?.[0])} />
            </div>
          ) : null}

          <form action={(formData) => void onPassword(formData)} className="space-y-4 rounded-xl border border-line bg-card p-6 shadow-sm">
            <p className="text-sm font-semibold text-ink">Password</p>
            <Field label="Current password">
              <input name="currentPassword" type="password" className={inputClass} required />
            </Field>
            <Field label="New password">
              <input name="newPassword" type="password" className={inputClass} required />
            </Field>
            <Field label="Confirm password">
              <input name="confirmPassword" type="password" className={inputClass} required />
            </Field>
            <button type="submit" className="rounded-md border border-line px-4 py-2.5 text-sm font-medium text-ink transition hover:border-accent">
              Update password
            </button>
          </form>
          <button
            type="button"
            className="w-full rounded-xl border border-line bg-card px-4 py-3 text-left text-sm text-ink hover:border-accent"
            onClick={() =>
              void authService.logoutAll().then(async () => {
                flash("Signed out of all sessions.");
                await logout();
                window.location.assign("/login");
              })
            }
          >
            Sign out of all devices
          </button>
        </div>
      </div>

      <section className="mt-6 rounded-xl border border-line bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Notifications</p>
            <p className="text-xs text-muted">{unread} unread</p>
          </div>
          <button type="button" onClick={() => void readAll()} className="text-xs font-medium text-accent hover:underline">
            Mark all read
          </button>
        </div>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted">No notifications yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {notifications.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="text-sm text-muted">{item.message}</p>
                  <p className="mt-1 text-xs text-muted">{formatDate(item.createdAt)}</p>
                </div>
                <button type="button" className="text-xs text-muted hover:text-ink" onClick={() => void removeNote(item.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form action={(formData) => void onDelete(formData)} className="mt-6 space-y-4 rounded-xl border border-red-200 bg-red-50/40 p-6">
        <p className="text-sm font-semibold text-red-800">Delete account</p>
        <p className="text-sm text-red-700">This deactivates your account. Enter your password to confirm.</p>
        <Field label="Password">
          <input name="password" type="password" className={inputClass} required />
        </Field>
        <button type="submit" className="rounded-md bg-red-700 px-4 py-2.5 text-sm font-medium text-white">
          Delete account
        </button>
      </form>
    </PageFade>
  );
}
