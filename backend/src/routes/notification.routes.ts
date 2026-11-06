import { Router } from "express";
import type { AppContainer } from "../container";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { notificationIdParamSchema, paginationSchema } from "../validators/pagination.schema";

export function createNotificationRoutes(container: AppContainer): Router {
  const router = Router();
  const { notificationController, authenticate } = container;

  router.use(authenticate.handle);
  router.get("/", validate(paginationSchema), asyncHandler(notificationController.list));
  router.get("/unread-count", asyncHandler(notificationController.unreadCount));
  router.patch("/read-all", asyncHandler(notificationController.markAllRead));
  router.patch("/:id/read", validate(notificationIdParamSchema), asyncHandler(notificationController.markRead));
  router.delete("/:id", validate(notificationIdParamSchema), asyncHandler(notificationController.remove));

  return router;
}
