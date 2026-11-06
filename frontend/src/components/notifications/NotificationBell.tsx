"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { notificationService } from "@/services/notification.service";
import type { Notification } from "@/types/api";

export function NotificationBell({ accountHref }: { accountHref: string }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [coords, setCoords] = useState({ top: 0, right: 16 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const refresh = useCallback(async () => {
    try {
      const [count, list] = await Promise.all([
        notificationService.unreadCount(),
        notificationService.list(1),
      ]);
      setUnread(count.data.unreadCount);
      setItems(list.data);
    } catch {
      setUnread(0);
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 25_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 8,
      right: Math.max(12, window.innerWidth - rect.right),
    });
  }, [open]);

  async function markAll() {
    await notificationService.markAllRead();
    await refresh();
  }

  async function markOne(item: Notification) {
    if (!item.isRead) {
      await notificationService.markRead(item.id);
      await refresh();
    }
  }

  const panel = open
    ? createPortal(
        <>
          <button
            type="button"
            className="fixed inset-0 z-[80] cursor-default bg-transparent"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed z-[90] w-80 overflow-hidden rounded-xl border border-line bg-card shadow-xl"
            style={{ top: coords.top, right: coords.right }}
          >
            <div className="flex items-center justify-between border-b border-line px-3 py-2">
              <p className="text-sm font-semibold text-ink">Notifications</p>
              <button type="button" className="text-xs text-accent hover:underline" onClick={() => void markAll()}>
                Mark all read
              </button>
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted">You are all caught up.</li>
              ) : (
                items.slice(0, 8).map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => void markOne(item)}
                      className={`block w-full px-3 py-3 text-left ${item.isRead ? "bg-card" : "bg-[#f3efe6]"}`}
                    >
                      <p className="text-sm font-medium text-ink">{item.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted">{item.message}</p>
                      <p className="mt-1 text-[11px] text-muted">{formatDate(item.createdAt)}</p>
                    </button>
                  </li>
                ))
              )}
            </ul>
            <Link
              href={accountHref}
              className="block border-t border-line px-3 py-2 text-center text-xs font-medium text-accent"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>
        </>,
        document.body,
      )
    : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative grid h-9 w-9 place-items-center rounded-full border border-line text-ink hover:border-accent"
        aria-label="Notifications"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
          <path d="M9 17a3 3 0 0 0 6 0" />
        </svg>
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>
      {panel}
    </div>
  );
}
