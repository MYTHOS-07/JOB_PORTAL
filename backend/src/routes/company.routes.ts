import { Router } from "express";
import type { AppContainer } from "../container";
import { authorize } from "../middleware/authorize";
import { imageUpload } from "../middleware/upload";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import {
  companyIdParamSchema,
  createCompanySchema,
  updateCompanySchema,
} from "../validators/company.schema";
import { paginationSchema } from "../validators/pagination.schema";

export function createCompanyRoutes(container: AppContainer): Router {
  const router = Router();
  const { companyController, authenticate } = container;

  router.get("/", validate(paginationSchema), asyncHandler(companyController.list));
  router.get("/me", authenticate.handle, authorize("EMPLOYER"), asyncHandler(companyController.getMine));
  router.post(
    "/",
    authenticate.handle,
    authorize("EMPLOYER"),
    validate(createCompanySchema),
    asyncHandler(companyController.create),
  );
  router.patch(
    "/me",
    authenticate.handle,
    authorize("EMPLOYER"),
    validate(updateCompanySchema),
    asyncHandler(companyController.updateMine),
  );
  router.patch(
    "/me/logo",
    authenticate.handle,
    authorize("EMPLOYER"),
    imageUpload.single("logo"),
    asyncHandler(companyController.updateLogo),
  );
  router.delete("/me", authenticate.handle, authorize("EMPLOYER"), asyncHandler(companyController.deleteMine));
  router.get("/:id/jobs", validate(companyIdParamSchema), asyncHandler(companyController.listJobs));
  router.get("/:id", validate(companyIdParamSchema), asyncHandler(companyController.getById));

  return router;
}
