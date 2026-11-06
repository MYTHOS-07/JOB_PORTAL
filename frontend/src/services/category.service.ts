import { api } from "@/lib/api";
import type { ApiSuccess, JobCategory } from "@/types/api";

export const categoryService = {
  list() {
    return api<ApiSuccess<JobCategory[]>>("/categories");
  },
};
