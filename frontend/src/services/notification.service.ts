import { api } from "@/lib/api";
import type { ApiSuccess, Notification, PaginationMeta } from "@/types/api";

export const notificationService = {
  list(page = 1) {
    return api<ApiSuccess<Notification[]> & { pagination: PaginationMeta }>("/notifications", {
      query: { page, limit: 12 },
    });
  },
  unreadCount() {
    return api<ApiSuccess<{ unreadCount: number }>>("/notifications/unread-count");
  },
  markRead(id: number) {
    return api<ApiSuccess<Notification>>(`/notifications/${id}/read`, { method: "PATCH" });
  },
  markAllRead() {
    return api<ApiSuccess<{ updated: number }>>("/notifications/read-all", { method: "PATCH" });
  },
  remove(id: number) {
    return api<ApiSuccess<null>>(`/notifications/${id}`, { method: "DELETE" });
  },
};
