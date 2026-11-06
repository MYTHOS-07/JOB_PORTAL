import { Router } from "express";
import type { AppContainer } from "../container";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { adminCompanyStatusSchema } from "../validators/company.schema";
import { jobIdParamSchema } from "../validators/job.schema";
import { paginationSchema } from "../validators/pagination.schema";
import { adminUserRoleSchema, adminUserStatusSchema, userIdParamSchema } from "../validators/user.schema";

export function createAdminRoutes(container: AppContainer): Router {
  const router = Router();
  const { adminController, authenticate } = container;

  router.use(authenticate.handle, authorize("ADMIN"));

  router.get("/dashboard", asyncHandler(adminController.dashboard));
  router.get("/users", validate(paginationSchema), asyncHandler(adminController.users));
  router.get("/users/:id", validate(userIdParamSchema), asyncHandler(adminController.userById));
  router.patch("/users/:id/status", validate(adminUserStatusSchema), asyncHandler(adminController.updateUserStatus));
  router.patch("/users/:id/role", validate(adminUserRoleSchema), asyncHandler(adminController.updateUserRole));
  router.delete("/users/:id", validate(userIdParamSchema), asyncHandler(adminController.deleteUser));
  router.get("/companies", validate(paginationSchema), asyncHandler(adminController.companies));
  router.patch(
    "/companies/:id/status",
    validate(adminCompanyStatusSchema),
    asyncHandler(adminController.updateCompanyStatus),
  );
  router.get("/jobs", validate(paginationSchema), asyncHandler(adminController.jobs));
  router.delete("/jobs/:id", validate(jobIdParamSchema), asyncHandler(adminController.deleteJob));
  router.get("/applications", validate(paginationSchema), asyncHandler(adminController.applications));
  router.get("/reports", asyncHandler(adminController.reports));

  return router;
}
