import pino from "pino";
import { env } from "./env";

/**
 * Sends structured JSON logs to Seq using the CLEF ingestion endpoint.
 * Passwords and full JWTs must never be written here.
 */
class SeqDestination {
  write(logLine: string): void {
    const body = this.toClef(logLine);
    if (!body) {
      return;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/vnd.serilog.clef",
    };

    if (env.SEQ_API_KEY) {
      headers["X-Seq-ApiKey"] = env.SEQ_API_KEY;
    }

    void fetch(`${env.SEQ_URL}/api/events/raw?clef`, {
      method: "POST",
      headers,
      body,
    }).catch(() => {
      // Seq must not crash the API if it is temporarily down.
    });
  }

  private toClef(logLine: string): string | null {
    try {
      const parsed = JSON.parse(logLine) as Record<string, unknown>;
      const event = {
        "@t": new Date().toISOString(),
        "@l": String(parsed.level ?? "info"),
        "@m": String(parsed.msg ?? parsed.message ?? ""),
        Mark: parsed.mark,
        ActorUserId: parsed.actorUserId,
        ActorEmail: parsed.actorEmail,
        ActorRole: parsed.actorRole,
        Problem: parsed.problem,
        Module: parsed.module,
        RequestId: parsed.reqId ?? parsed.requestId,
        ...parsed,
      };
      return JSON.stringify(event);
    } catch {
      return null;
    }
  }
}

/**
 * Application logger. Console output in development; Seq in all environments.
 */
export const logger = pino(
  {
    level: env.NODE_ENV === "production" ? "info" : "debug",
    redact: {
      paths: ["password", "req.headers.authorization", "req.headers.cookie"],
      censor: "[REDACTED]",
    },
  },
  pino.multistream([
    { stream: process.stdout },
    { stream: new SeqDestination() },
  ]),
);
