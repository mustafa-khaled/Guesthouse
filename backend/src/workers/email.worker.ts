import { Worker, Job } from "bullmq";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type { Transporter } from "nodemailer";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import type { EmailJobData } from "../lib/queue";

let transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;

function getTransporter(): { transporter: Transporter<SMTPTransport.SentMessageInfo>; from: string } | null {
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

async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const { to, subject, html } = job.data;

  logger.info({ jobId: job.id, to, subject, attempt: job.attemptsMade + 1 }, "Processing email job");

  const config = getTransporter();
  if (!config) {
    logger.warn({ jobId: job.id }, "SMTP not configured, skipping email");
    return;
  }

  await config.transporter.sendMail({
    from: config.from,
    to,
    subject,
    html,
  });

  logger.info({ jobId: job.id, to, subject }, "Email sent successfully");
}

function getRedisConnection() {
  if (!env.REDIS_URL) {
    return null;
  }

  const url = new URL(env.REDIS_URL);
  return {
    host: url.hostname,
    port: parseInt(url.port) || 6379,
    password: url.password || undefined,
  };
}

let emailWorker: Worker<EmailJobData> | null = null;

export function startEmailWorker(): Worker<EmailJobData> | null {
  const connection = getRedisConnection();
  if (!connection) {
    logger.warn("Redis not configured, email worker not started");
    return null;
  }

  if (emailWorker) {
    return emailWorker;
  }

  emailWorker = new Worker<EmailJobData>(
    "email",
    processEmailJob,
    {
      connection,
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 1000,
      },
    }
  );

  emailWorker.on("completed", (job) => {
    logger.debug({ jobId: job.id }, "Email worker completed job");
  });

  emailWorker.on("failed", (job, err) => {
    logger.error(
      { jobId: job?.id, err, attempts: job?.attemptsMade },
      "Email worker job failed"
    );
  });

  emailWorker.on("error", (err) => {
    logger.error({ err }, "Email worker error");
  });

  logger.info("Email worker started");
  return emailWorker;
}

export async function stopEmailWorker(): Promise<void> {
  if (emailWorker) {
    await emailWorker.close();
    emailWorker = null;
    logger.info("Email worker stopped");
  }
}

export function getEmailWorker(): Worker<EmailJobData> | null {
  return emailWorker;
}
