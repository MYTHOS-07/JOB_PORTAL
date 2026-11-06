import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { MESSAGES } from "../constants/messages";
import { ApiError } from "../utils/ApiError";

/**
 * Runs a Zod schema against params, query and body.
 */
export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      params: req.params,
      query: req.query,
      body: req.body,
    });

    if (!result.success) {
      next(ApiError.badRequest(MESSAGES.VALIDATION, result.error.flatten()));
      return;
    }

    const data = result.data as {
      params?: Record<string, unknown>;
      query?: Record<string, unknown>;
      body?: unknown;
    };

    // Express 5 makes req.query a getter, so it cannot be replaced.
    if (data.params) {
      Object.assign(req.params, data.params);
    }
    if (data.body !== undefined) {
      req.body = data.body;
    }

    next();
  };
}
