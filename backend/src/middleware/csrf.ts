import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Double-submit cookie CSRF check. Disabled when CSRF_ENABLED=false
 * so Postman and API tests stay simple during coursework.
 */
export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  if (!env.CSRF_ENABLED || SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const cookieToken = req.cookies?.[env.CSRF_COOKIE_NAME] as string | undefined;
  const headerToken = req.headers["x-csrf-token"];

  if (!cookieToken || typeof headerToken !== "string" || cookieToken !== headerToken) {
    next(ApiError.forbidden("Invalid CSRF token."));
    return;
  }

  next();
}
