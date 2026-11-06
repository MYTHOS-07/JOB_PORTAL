import { Router } from "express";
import type { AppContainer } from "../container";
import { asyncHandler } from "../utils/asyncHandler";
import { loginRateLimiter, passwordResetRateLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validators/auth.schema";

export function createAuthRoutes(container: AppContainer): Router {
  const router = Router();
  const { authController, authenticate } = container;

  router.post("/register", validate(registerSchema), asyncHandler(authController.register));
  router.post("/login", loginRateLimiter, validate(loginSchema), asyncHandler(authController.login));
  router.post("/logout", authenticate.handle, asyncHandler(authController.logout));
  router.post("/logout-all", authenticate.handle, asyncHandler(authController.logoutAll));
  router.get("/me", authenticate.handle, asyncHandler(authController.me));
  router.post(
    "/forgot-password",
    passwordResetRateLimiter,
    validate(forgotPasswordSchema),
    asyncHandler(authController.forgotPassword),
  );
  router.post("/reset-password", validate(resetPasswordSchema), asyncHandler(authController.resetPassword));
  router.patch(
    "/change-password",
    authenticate.handle,
    validate(changePasswordSchema),
    asyncHandler(authController.changePassword),
  );
  router.get("/csrf", asyncHandler(authController.csrf));

  return router;
}
