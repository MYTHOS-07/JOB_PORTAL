import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { LOG_MARK, moduleFromPath } from "../constants/log-marks";
import { HTTP_STATUS } from "../constants/http-status";
import { MESSAGES } from "../constants/messages";
import { ApiError } from "../utils/ApiError";
import { logError, logWarn } from "../utils/requestLog";

/**
 * Central error handler. Converts known errors into a consistent JSON body.
 */
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const base = {
    path: req.path,
    method: req.method,
    module: moduleFromPath(String(req.originalUrl ?? req.path)),
    actorUserId: req.user?.id ?? null,
    actorEmail: req.user?.email ?? null,
    actorRole: req.user?.role ?? null,
  };

  if (error instanceof ApiError) {
    const fields = {
      ...base,
      mark: LOG_MARK.HTTP_PROBLEM,
      problem: error.message,
      statusCode: error.statusCode,
    };
    if (error.statusCode >= 500) {
      logError(fields, error.message, req);
    } else {
      logWarn(fields, error.message, req);
    }
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
    });
    return;
  }

  if (error instanceof ZodError) {
    logWarn(
      {
        ...base,
        mark: LOG_MARK.HTTP_PROBLEM,
        problem: MESSAGES.VALIDATION,
        statusCode: HTTP_STATUS.BAD_REQUEST,
      },
      MESSAGES.VALIDATION,
      req,
    );
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: MESSAGES.VALIDATION,
      details: error.flatten(),
    });
    return;
  }

  logError(
    {
      ...base,
      mark: LOG_MARK.HTTP_UNHANDLED,
      problem: error instanceof Error ? error.message : "unknown",
      err: error,
    },
    "Unhandled error",
    req,
  );
  res.status(HTTP_STATUS.INTERNAL_ERROR).json({
    success: false,
    message: MESSAGES.INTERNAL,
  });
}
