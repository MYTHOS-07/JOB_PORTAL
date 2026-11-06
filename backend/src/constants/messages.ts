/**
 * User-facing API messages. Keep them generic where security matters.
 */
export const MESSAGES = {
  AUTH: {
    REGISTER_SUCCESS: "Account created successfully.",
    LOGIN_SUCCESS: "Logged in successfully.",
    LOGOUT_SUCCESS: "Logged out successfully.",
    LOGOUT_ALL_SUCCESS: "All sessions have been signed out.",
    INVALID_CREDENTIALS: "Invalid email or password.",
    UNAUTHORIZED: "Authentication is required.",
    FORBIDDEN: "You do not have permission to perform this action.",
    ACCOUNT_SUSPENDED: "This account has been suspended.",
    FORGOT_PASSWORD:
      "If an account exists for this email, a password reset link has been sent.",
    RESET_SUCCESS: "Your password has been reset successfully.",
    RESET_INVALID: "This password reset link is invalid or has expired.",
    PASSWORD_CHANGED: "Your password has been changed. Please log in again.",
    TOKEN_REVOKED: "This session is no longer valid.",
  },
  USER: {
    NOT_FOUND: "User not found.",
    UPDATED: "Profile updated successfully.",
    DELETED: "Account deleted successfully.",
    AVATAR_UPDATED: "Profile picture updated.",
    RESUME_UPDATED: "Resume uploaded.",
  },
  COMPANY: {
    NOT_FOUND: "Company not found.",
    ALREADY_EXISTS: "You already have a company profile.",
    CREATED: "Company profile created.",
    UPDATED: "Company profile updated.",
    DELETED: "Company profile deleted.",
    SUSPENDED: "This company is not currently active.",
  },
  JOB: {
    NOT_FOUND: "Job not found.",
    CREATED: "Job created.",
    UPDATED: "Job updated.",
    DELETED: "Job deleted.",
    NOT_PUBLISHED: "This job is not open for applications.",
    DEADLINE_PASSED: "The application deadline has passed.",
    CACHE_INVALIDATED: "Job cache cleared.",
  },
  APPLICATION: {
    CREATED: "Application submitted.",
    NOT_FOUND: "Application not found.",
    DUPLICATE: "You have already applied for this job.",
    WITHDRAWN: "Application withdrawn.",
    STATUS_UPDATED: "Application status updated.",
  },
  CATEGORY: {
    NOT_FOUND: "Category not found.",
    CREATED: "Category created.",
    UPDATED: "Category updated.",
    DELETED: "Category deleted.",
  },
  NOTIFICATION: {
    NOT_FOUND: "Notification not found.",
    MARKED_READ: "Notification marked as read.",
    ALL_READ: "All notifications marked as read.",
    DELETED: "Notification deleted.",
  },
  VALIDATION: "Please check the submitted data.",
  INTERNAL: "Something went wrong. Please try again later.",
} as const;
