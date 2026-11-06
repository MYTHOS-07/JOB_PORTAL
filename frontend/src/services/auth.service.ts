import { api, type ApiError } from "@/lib/api";
import type { ApiSuccess, Role, User } from "@/types/api";

export const authService = {
  me() {
    return api<ApiSuccess<User>>("/auth/me");
  },
  login(email: string, password: string) {
    return api<ApiSuccess<User>>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  },
  register(input: { name: string; email: string; password: string; role: Role }) {
    return api<ApiSuccess<User>>("/auth/register", { method: "POST", body: input });
  },
  logout() {
    return api<ApiSuccess<null>>("/auth/logout", { method: "POST" });
  },
  logoutAll() {
    return api<ApiSuccess<null>>("/auth/logout-all", { method: "POST" });
  },
  forgotPassword(email: string) {
    return api<ApiSuccess<{ resetUrl?: string }>>("/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
  },
  resetPassword(token: string, newPassword: string, confirmPassword: string) {
    return api<ApiSuccess<null>>("/auth/reset-password", {
      method: "POST",
      body: { token, newPassword, confirmPassword },
    });
  },
  changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    return api<ApiSuccess<null>>("/auth/change-password", {
      method: "PATCH",
      body: { currentPassword, newPassword, confirmPassword },
    });
  },
};

export function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as ApiError).message);
  }
  return "Something went wrong.";
}
