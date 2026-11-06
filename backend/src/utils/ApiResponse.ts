import type { Response } from "express";
import type { PaginationMeta } from "./pagination";

/**
 * Builds consistent JSON envelopes for success responses.
 */
export class ApiResponse {
  /**
   * Sends a success payload without pagination.
   */
  static success<T>(
    res: Response,
    data: T,
    message = "OK",
    statusCode = 200,
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Sends a paginated list.
   */
  static paged<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    message = "OK",
  ): Response {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  }
}
