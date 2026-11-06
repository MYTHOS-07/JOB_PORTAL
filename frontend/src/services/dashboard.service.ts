import { api } from "@/lib/api";
import type {
  ApiSuccess,
  Application,
  Company,
  Job,
  SeekerDashboard,
  EmployerDashboard,
  AdminDashboard,
} from "@/types/api";

export const dashboardService = {
  seeker() {
    return api<ApiSuccess<SeekerDashboard>>("/dashboard/seeker");
  },
  employer() {
    return api<ApiSuccess<EmployerDashboard>>("/dashboard/employer");
  },
  admin() {
    return api<ApiSuccess<AdminDashboard>>("/dashboard/admin");
  },
};

export type { Application, Company, Job };
