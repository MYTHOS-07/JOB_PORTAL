import { Router } from "express";
import type { AppContainer } from "../container";
import { authorize } from "../middleware/authorize";
import { imageUpload, resumeUpload } from "../middleware/upload";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { deleteAccountSchema, updateProfileSchema, userIdParamSchema } from "../validators/user.schema";

export function createUserRoutes(container: AppContainer): Router {
  const router = Router();
  const { userController, authenticate } = container;

  router.use(authenticate.handle);
  router.get("/me", asyncHandler(userController.getMe));
  router.patch("/me", validate(updateProfileSchema), asyncHandler(userController.updateMe));
  router.delete("/me", validate(deleteAccountSchema), asyncHandler(userController.deleteMe));
  router.patch("/me/avatar", imageUpload.single("avatar"), asyncHandler(userController.updateAvatar));
  router.patch(
    "/me/resume",
    authorize("JOB_SEEKER"),
    resumeUpload.single("resume"),
    asyncHandler(userController.updateResume),
  );
  router.get("/:id", validate(userIdParamSchema), asyncHandler(userController.getById));

  return router;
}
