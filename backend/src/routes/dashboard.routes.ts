import { Router } from "express";
import type { AppContainer } from "../container";
import { authorize } from "../middleware/authorize";
import { asyncHandler } from "../utils/asyncHandler";

export function createDashboardRoutes(container: AppContainer): Router {
  const router = Router();
  const { dashboardController, authenticate } = container;

  router.use(authenticate.handle);
  router.get("/seeker", authorize("JOB_SEEKER"), asyncHandler(dashboardController.seeker));
  router.get("/employer", authorize("EMPLOYER"), asyncHandler(dashboardController.employer));
  router.get("/admin", authorize("ADMIN"), asyncHandler(dashboardController.admin));

  return router;
}
