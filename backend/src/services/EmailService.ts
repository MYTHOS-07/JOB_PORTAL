import { env } from "../config/env";
import { mailTransport } from "../config/email";
import { LOG_MARK } from "../constants/log-marks";
import { logError, logInfo } from "../utils/requestLog";

/**
 * Sends transactional emails through smtp4dev (local) or a real SMTP host.
 * Controllers never call nodemailer directly.
 */
export class EmailService {
  /**
   * Sends a welcome email after registration.
   */
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await this.send(
      to,
      `Welcome to ${env.APP_NAME}`,
      `<p>Hello ${name},</p>
       <p>Your ${env.APP_NAME} account is ready. You can now log in and start using the portal.</p>
       <p>Regards,<br/>${env.APP_NAME} Support Team</p>`,
    );
  }

  /**
   * Sends the one-time password reset link.
   */
  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
    await this.send(
      to,
      `Reset Your ${env.APP_NAME} Password`,
      `<p>Hello ${name},</p>
       <p>We received a request to reset the password associated with your ${env.APP_NAME} account.</p>
       <p><a href="${resetUrl}">Reset your password</a></p>
       <p>This link expires in 15 minutes and can only be used once.</p>
       <p>If you did not request a password reset, you can safely ignore this email.</p>
       <p>Regards,<br/>${env.APP_NAME} Support Team</p>`,
    );
  }

  /**
   * Confirms that a password was changed or reset.
   */
  async sendPasswordChangedEmail(to: string, name: string): Promise<void> {
    await this.send(
      to,
      `Your ${env.APP_NAME} password was changed`,
      `<p>Hello ${name},</p>
       <p>Your password was changed successfully. If you did not do this, contact support immediately.</p>
       <p>Regards,<br/>${env.APP_NAME} Support Team</p>`,
    );
  }

  /**
   * Confirms a job application to the seeker.
   */
  async sendApplicationConfirmation(
    to: string,
    name: string,
    jobTitle: string,
    companyName: string,
  ): Promise<void> {
    await this.send(
      to,
      `Application received: ${jobTitle}`,
      `<p>Hello ${name},</p>
       <p>We have received your application for <strong>${jobTitle}</strong> at ${companyName}.</p>
       <p>You can track the status from your dashboard.</p>
       <p>Regards,<br/>${env.APP_NAME}</p>`,
    );
  }

  /**
   * Notifies an employer that a new application arrived.
   */
  async sendNewApplicationToEmployer(
    to: string,
    employerName: string,
    jobTitle: string,
    applicantName: string,
  ): Promise<void> {
    await this.send(
      to,
      `New application for ${jobTitle}`,
      `<p>Hello ${employerName},</p>
       <p>${applicantName} applied for <strong>${jobTitle}</strong>.</p>
       <p>Open your employer dashboard to review the application.</p>
       <p>Regards,<br/>${env.APP_NAME}</p>`,
    );
  }

  /**
   * Notifies a seeker that their application status changed.
   */
  async sendApplicationStatusEmail(
    to: string,
    name: string,
    jobTitle: string,
    status: string,
  ): Promise<void> {
    await this.send(
      to,
      `Application update: ${jobTitle}`,
      `<p>Hello ${name},</p>
       <p>Your application for <strong>${jobTitle}</strong> is now: <strong>${status}</strong>.</p>
       <p>Regards,<br/>${env.APP_NAME}</p>`,
    );
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await mailTransport.sendMail({
        from: env.SMTP_FROM,
        to,
        subject,
        html,
      });
      logInfo({ mark: LOG_MARK.EMAIL_SENT, actorEmail: to, module: "email" }, subject);
    } catch (error) {
      logError(
        { mark: LOG_MARK.EMAIL_FAIL, problem: "smtp_failed", actorEmail: to, err: error, module: "email" },
        "Email send failed",
      );
    }
  }
}
