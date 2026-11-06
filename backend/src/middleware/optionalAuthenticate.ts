import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { AuthenticateMiddleware } from "./authenticate";

/**
 * Attaches req.user when a valid token is present, otherwise continues as guest.
 */
export function optionalAuthenticate(authenticate: AuthenticateMiddleware) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const hasCookie = Boolean(req.cookies?.[env.JWT_COOKIE_NAME]);
    const hasHeader = Boolean(req.headers.authorization);
    if (!hasCookie && !hasHeader) {
      next();
      return;
    }

    await authenticate.handle(req, res, (error?: unknown) => {
      if (error) {
        next();
        return;
      }
      next();
    });
  };
}
