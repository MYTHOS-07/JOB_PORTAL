/**
 * Application roles. Administrators cannot self-register.
 */
export const ROLES = {
  JOB_SEEKER: "JOB_SEEKER",
  EMPLOYER: "EMPLOYER",
  ADMIN: "ADMIN",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const PUBLIC_REGISTER_ROLES = [ROLES.JOB_SEEKER, ROLES.EMPLOYER] as const;
