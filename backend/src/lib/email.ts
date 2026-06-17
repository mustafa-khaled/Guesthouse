import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type { Transporter } from "nodemailer";
import { env } from "../config/env";
import { logger } from "./logger";
import { addEmailJob } from "./queue";

let transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;

function getTransporter() {
  const host = env.SMTP_HOST;
  const user = env.SMTP_USER;
  const password = env.SMTP_PASSWORD;

  if (!host || !user || !password) {
    return null;
  }

  const port = env.SMTP_PORT;
  const from = env.SMTP_EMAIL_FROM || user;

  if (!transporter) {
    const options: SMTPTransport.Options = {
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
    };
    transporter = nodemailer.createTransport(options);
  }

  return { transporter, from };
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  options: { sync?: boolean; priority?: number } = {}
): Promise<boolean> {
  const config = getTransporter();
  if (!config) {
    logger.warn("SMTP configuration is incomplete; email not sent");
    return false;
  }

  if (!options.sync) {
    const jobId = await addEmailJob({ to, subject, html }, options.priority);
    if (jobId) {
      return true;
    }
    logger.info({ to, subject }, "Queue unavailable, sending email synchronously");
  }

  try {
    await config.transporter.sendMail({
      from: config.from,
      to,
      subject,
      html,
    });
    logger.info({ to, subject }, "Email sent synchronously");
    return true;
  } catch (error) {
    logger.error({ err: error, to, subject }, "Failed to send email");
    throw error;
  }
}

export async function sendEmailSync(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  return sendEmail(to, subject, html, { sync: true });
}

export async function queueEmail(
  to: string,
  subject: string,
  html: string,
  priority: number = 0
): Promise<string | null> {
  return addEmailJob({ to, subject, html }, priority);
}
