import nodemailer from "nodemailer";
import { env } from "./env";

/**
 * SMTP transport. In local development this points at smtp4dev.
 */
export const mailTransport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth:
    env.SMTP_USER && env.SMTP_PASS
      ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
      : undefined,
  tls: {
    rejectUnauthorized: false,
  },
});
