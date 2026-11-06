import { Router } from "express";
import type { AppContainer } from "../container";
import { env } from "../config/env";
import { authorize } from "../middleware/authorize";
import { asyncHandler } from "../utils/asyncHandler";

export function createHealthRoutes(container: AppContainer): Router {
  const router = Router();
  const { healthController, authenticate } = container;

  router.get("/", asyncHandler(healthController.basic));
  router.get("/database", asyncHandler(healthController.database));
  router.get("/redis", asyncHandler(healthController.redis));

  if (env.NODE_ENV === "development") {
    router.get("/services", asyncHandler(healthController.services));
  } else {
    router.get(
      "/services",
      authenticate.handle,
      authorize("ADMIN"),
      asyncHandler(healthController.services),
    );
  }

  return router;
}
