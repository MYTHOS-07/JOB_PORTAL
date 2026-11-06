import { HTTP_STATUS } from "../constants/http-status";

/**
 * Standard application error that the global error handler understands.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = "ApiError";
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, details);
  }

  static unauthorized(message: string, details?: unknown): ApiError {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message, details);
  }

  static forbidden(message: string, details?: unknown): ApiError {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message, details);
  }

  static notFound(message: string): ApiError {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(HTTP_STATUS.CONFLICT, message);
  }

  static tooManyRequests(message: string): ApiError {
    return new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, message);
  }

  static internal(message: string): ApiError {
    return new ApiError(HTTP_STATUS.INTERNAL_ERROR, message);
  }
}
