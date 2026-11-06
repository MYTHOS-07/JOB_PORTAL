import { env } from "./config/env";
import { prisma } from "./config/database";
import { redis } from "./config/redis";
import { logger } from "./config/logger";
import app from "./app";

const server = app.listen(env.PORT, () => {
  logger.info({ mark: "sys.start", module: "server" }, `[sys.start] Elevate Workforce API running on http://localhost:${env.PORT}`);
});

async function shutdown(): Promise<void> {
  logger.info({ mark: "sys.stop", module: "server" }, "[sys.stop] Shutting down");
  server.close();
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
