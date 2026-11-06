import type { Request, Response } from "express";
import { env } from "../config/env";
import { checkDatabaseConnection } from "../config/database";
import { checkRedisConnection } from "../config/redis";
import { HTTP_STATUS } from "../constants/http-status";
import { ApiResponse } from "../utils/ApiResponse";

export class HealthController {
  /**
   * GET /api/health
   */
  basic = async (_req: Request, res: Response): Promise<void> => {
    ApiResponse.success(res, {
      service: env.APP_NAME,
      timestamp: new Date().toISOString(),
    });
  };

  /**
   * GET /api/health/database
   */
  database = async (_req: Request, res: Response): Promise<void> => {
    const ok = await checkDatabaseConnection();
    res.status(ok ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      success: ok,
      data: { postgres: ok ? "up" : "down" },
    });
  };

  /**
   * GET /api/health/redis
   */
  redis = async (_req: Request, res: Response): Promise<void> => {
    const ok = await checkRedisConnection();
    res.status(ok ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      success: ok,
      data: { redis: ok ? "up" : "down" },
    });
  };

  /**
   * GET /api/health/services
   */
  services = async (_req: Request, res: Response): Promise<void> => {
    const [postgres, redis] = await Promise.all([
      checkDatabaseConnection(),
      checkRedisConnection(),
    ]);
    const ok = postgres && redis;
    res.status(ok ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      success: ok,
      data: {
        postgres: postgres ? "up" : "down",
        redis: redis ? "up" : "down",
        seq: env.SEQ_URL,
        smtp: `${env.SMTP_HOST}:${env.SMTP_PORT}`,
      },
    });
  };
}
