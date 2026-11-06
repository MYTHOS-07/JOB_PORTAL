import { api } from "@/lib/api";
import type { ApiSuccess, User } from "@/types/api";

export const userService = {
  me() {
    return api<ApiSuccess<User>>("/users/me");
  },
  updateMe(body: Record<string, unknown>) {
    return api<ApiSuccess<User>>("/users/me", { method: "PATCH", body });
  },
  deleteMe(password: string) {
    return api<ApiSuccess<null>>("/users/me", { method: "DELETE", body: { password } });
  },
  uploadResume(file: File) {
    const body = new FormData();
    body.append("resume", file);
    return api<ApiSuccess<User>>("/users/me/resume", { method: "PATCH", body });
  },
  uploadAvatar(file: File) {
    const body = new FormData();
    body.append("avatar", file);
    return api<ApiSuccess<User>>("/users/me/avatar", { method: "PATCH", body });
  },
};
