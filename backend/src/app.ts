import path from "path";
import { randomUUID } from "crypto";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { LOG_MARK, moduleFromPath } from "./constants/log-marks";
import { createAppContainer } from "./container";
import { csrfProtection } from "./middleware/csrf";
import { errorHandler } from "./middleware/errorHandler";
import { apiRateLimiter } from "./middleware/rateLimiter";
import { createAdminRoutes } from "./routes/admin.routes";
import { createApplicationRoutes } from "./routes/application.routes";
import { createAuthRoutes } from "./routes/auth.routes";
import { createCategoryRoutes } from "./routes/category.routes";
import { createCompanyRoutes } from "./routes/company.routes";
import { createDashboardRoutes } from "./routes/dashboard.routes";
import { createHealthRoutes } from "./routes/health.routes";
import { createJobRoutes } from "./routes/job.routes";
import { createNotificationRoutes } from "./routes/notification.routes";
import { createUserRoutes } from "./routes/user.routes";

/**
 * Builds the Express application with middleware, static files and REST routes.
 */
export function createApp() {
  const app = express();
  const container = createAppContainer();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => String(req.headers["x-request-id"] ?? randomUUID()),
      customProps: (req) => ({
        mark: LOG_MARK.HTTP_REQUEST,
        module: moduleFromPath(String(req.originalUrl ?? req.url ?? "")),
        actorUserId: req.user?.id ?? null,
        actorEmail: req.user?.email ?? null,
        actorRole: req.user?.role ?? null,
      }),
      customLogLevel: (_req, res, error) => {
        if (error || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
      customSuccessMessage: (req, res) =>
        `[${LOG_MARK.HTTP_REQUEST}] ${req.method} ${req.originalUrl ?? req.url} ${res.statusCode}`,
      customErrorMessage: (req, res, error) =>
        `[${LOG_MARK.HTTP_PROBLEM}] ${req.method} ${req.originalUrl ?? req.url} ${res.statusCode} ${error.message}`,
      autoLogging: {
        ignore: (req) => req.url.startsWith("/api/health"),
      },
    }),
  );
  
  app.use(apiRateLimiter);
  app.use(csrfProtection);

  app.use(
    "/uploads",
    (_req, res, next) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      next();
    },
    express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)),
  );

  app.use("/api/auth", createAuthRoutes(container));
  app.use("/api/users", createUserRoutes(container));
  app.use("/api/companies", createCompanyRoutes(container));
  app.use("/api/jobs", createJobRoutes(container));
  app.use("/api/applications", createApplicationRoutes(container));
  app.use("/api/categories", createCategoryRoutes(container));
  app.use("/api/notifications", createNotificationRoutes(container));
  app.use("/api/admin", createAdminRoutes(container));
  app.use("/api/dashboard", createDashboardRoutes(container));
  app.use("/api/health", createHealthRoutes(container));

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
    });
  });

  app.use(errorHandler);
  return app;
}

export default createApp();
