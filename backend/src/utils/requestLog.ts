import type { Request } from "express";
import type { Logger } from "pino";
import { logger } from "../config/logger";
import type { LogMark } from "../constants/log-marks";

export interface LogFields {
  mark: LogMark | string;
  problem?: string;
  actorUserId?: number | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  targetUserId?: number | null;
  targetJobId?: number | null;
  module?: string;
  [key: string]: unknown;
}

function withLogger(req?: Request): Logger {
  return (req?.log as Logger | undefined) ?? logger;
}

function prefix(mark: string, message: string): string {
  return `[${mark}] ${message}`;
}

export function logInfo(fields: LogFields, message: string, req?: Request): void {
  withLogger(req).info(fields, prefix(String(fields.mark), message));
}

export function logWarn(fields: LogFields, message: string, req?: Request): void {
  withLogger(req).warn(fields, prefix(String(fields.mark), message));
}

export function logError(fields: LogFields, message: string, req?: Request): void {
  withLogger(req).error(fields, prefix(String(fields.mark), message));
}

export function bindActor(req: Request): void {
  if (!req.user || !req.log) {
    return;
  }

  req.log = req.log.child({
    actorUserId: req.user.id,
    actorEmail: req.user.email,
    actorRole: req.user.role,
  });
}
