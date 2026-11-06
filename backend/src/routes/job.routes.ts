import { Router } from "express";
import type { AppContainer } from "../container";
import { authorize } from "../middleware/authorize";
import { optionalAuthenticate } from "../middleware/optionalAuthenticate";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createJobSchema,
  jobIdParamSchema,
  jobStatusSchema,
  updateJobSchema,
} from "../validators/job.schema";
import { paginationSchema } from "../validators/pagination.schema";

export function createJobRoutes(container: AppContainer): Router {
  const router = Router();
  const { jobController, authenticate } = container;

  router.get("/", validate(paginationSchema), asyncHandler(jobController.list));
  router.get(
    "/my-jobs",
    authenticate.handle,
    authorize("EMPLOYER", "ADMIN"),
    validate(paginationSchema),
    asyncHandler(jobController.myJobs),
  );
  router.get(
    "/:id/statistics",
    authenticate.handle,
    authorize("EMPLOYER", "ADMIN"),
    validate(jobIdParamSchema),
    asyncHandler(jobController.statistics),
  );
  router.get(
    "/:id",
    optionalAuthenticate(authenticate),
    validate(jobIdParamSchema),
    asyncHandler(jobController.getById),
  );
  router.post(
    "/",
    authenticate.handle,
    authorize("EMPLOYER", "ADMIN"),
    validate(createJobSchema),
    asyncHandler(jobController.create),
  );
  router.patch(
    "/:id",
    authenticate.handle,
    authorize("EMPLOYER", "ADMIN"),
    validate(updateJobSchema),
    asyncHandler(jobController.update),
  );
  router.patch(
    "/:id/status",
    authenticate.handle,
    authorize("EMPLOYER", "ADMIN"),
    validate(jobStatusSchema),
    asyncHandler(jobController.changeStatus),
  );
  router.delete(
    "/:id",
    authenticate.handle,
    authorize("EMPLOYER", "ADMIN"),
    validate(jobIdParamSchema),
    asyncHandler(jobController.remove),
  );

  return router;
}
