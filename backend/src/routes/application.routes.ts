import { Router } from "express";
import type { AppContainer } from "../container";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import {
  applicationIdParamSchema,
  applicationStatusSchema,
  applySchema,
  jobApplicantsParamSchema,
} from "../validators/application.schema";
import { paginationSchema } from "../validators/pagination.schema";

export function createApplicationRoutes(container: AppContainer): Router {
  const router = Router();
  const { applicationController, authenticate } = container;

  router.use(authenticate.handle);

  router.post("/", authorize("JOB_SEEKER"), validate(applySchema), asyncHandler(applicationController.apply));
  router.get(
    "/my-applications",
    authorize("JOB_SEEKER"),
    validate(paginationSchema),
    asyncHandler(applicationController.myApplications),
  );
  router.get(
    "/employer",
    authorize("EMPLOYER", "ADMIN"),
    validate(paginationSchema),
    asyncHandler(applicationController.employerApplications),
  );
  router.get(
    "/job/:jobId",
    authorize("EMPLOYER", "ADMIN"),
    validate(jobApplicantsParamSchema),
    asyncHandler(applicationController.byJob),
  );
  router.get("/:id", validate(applicationIdParamSchema), asyncHandler(applicationController.getById));
  router.patch(
    "/:id/withdraw",
    authorize("JOB_SEEKER"),
    validate(applicationIdParamSchema),
    asyncHandler(applicationController.withdraw),
  );
  router.patch(
    "/:id/status",
    authorize("EMPLOYER", "ADMIN"),
    validate(applicationStatusSchema),
    asyncHandler(applicationController.updateStatus),
  );

  return router;
}
