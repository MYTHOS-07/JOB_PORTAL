/**
 * Stable log markers. Filter Seq or stdout with `mark = 'auth.login'`.
 */
export const LOG_MARK = {
  HTTP_REQUEST: "http.request",
  HTTP_PROBLEM: "http.problem",
  HTTP_UNHANDLED: "http.unhandled",

  AUTH_REGISTER: "auth.register",
  AUTH_LOGIN: "auth.login",
  AUTH_LOGIN_FAIL: "auth.login.fail",
  AUTH_LOGOUT: "auth.logout",
  AUTH_LOGOUT_ALL: "auth.logout.all",
  AUTH_FORGOT: "auth.password.forgot",
  AUTH_RESET: "auth.password.reset",
  AUTH_CHANGE: "auth.password.change",

  USER_UPDATE: "user.profile.update",
  USER_AVATAR: "user.avatar.update",
  USER_RESUME: "user.resume.update",
  USER_DELETE: "user.account.delete",
  USER_ROLE: "admin.user.role",
  USER_STATUS: "admin.user.status",
  USER_ADMIN_DELETE: "admin.user.delete",

  JOB_CREATE: "job.create",
  JOB_UPDATE: "job.update",
  JOB_STATUS: "job.status",
  JOB_DELETE: "job.delete",

  APPLICATION_CREATE: "application.create",
  APPLICATION_STATUS: "application.status",
  APPLICATION_WITHDRAW: "application.withdraw",

  COMPANY_CREATE: "company.create",
  COMPANY_UPDATE: "company.update",
  COMPANY_STATUS: "admin.company.status",

  EMAIL_SENT: "email.sent",
  EMAIL_FAIL: "email.fail",

  NOTIFY_CREATE: "notification.create",
} as const;

export type LogMark = (typeof LOG_MARK)[keyof typeof LOG_MARK];

export function moduleFromPath(path: string): string {
  const clean = path.split("?")[0];
  const parts = clean.split("/").filter(Boolean);
  if (parts[0] === "api") {
    return parts[1] ?? "api";
  }
  return parts[0] ?? "root";
}
