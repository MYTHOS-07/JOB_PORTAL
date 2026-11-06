import type { NextFunction, Request, Response } from "express";
import type { Role } from "../generated/prisma/client";
import { MESSAGES } from "../constants/messages";
import { ApiError } from "../utils/ApiError";

/**
 * Restricts a route to one or more roles after authentication.
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized(MESSAGES.AUTH.UNAUTHORIZED));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(ApiError.forbidden(MESSAGES.AUTH.FORBIDDEN));
      return;
    }

    next();
  };
}
