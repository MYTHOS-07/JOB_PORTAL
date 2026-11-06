import { Router } from "express";
import type { AppContainer } from "../container";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { categoryBodySchema, categoryIdParamSchema } from "../validators/pagination.schema";

export function createCategoryRoutes(container: AppContainer): Router {
  const router = Router();
  const { categoryController, authenticate } = container;

  router.get("/", asyncHandler(categoryController.list));
  router.get("/:id", validate(categoryIdParamSchema), asyncHandler(categoryController.getById));
  router.post(
    "/",
    authenticate.handle,
    authorize("ADMIN"),
    validate(categoryBodySchema),
    asyncHandler(categoryController.create),
  );
  router.patch(
    "/:id",
    authenticate.handle,
    authorize("ADMIN"),
    validate(categoryIdParamSchema),
    validate(categoryBodySchema),
    asyncHandler(categoryController.update),
  );
  router.delete(
    "/:id",
    authenticate.handle,
    authorize("ADMIN"),
    validate(categoryIdParamSchema),
    asyncHandler(categoryController.remove),
  );

  return router;
}
