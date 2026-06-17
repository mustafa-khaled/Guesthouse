import { Queue, QueueEvents } from "bullmq";
import { env } from "../config/env";
import { logger } from "./logger";

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  template?: string;
  context?: Record<string, unknown>;
}

export interface NotificationJobData {
  type: "booking_confirmation" | "booking_cancelled" | "payment_received" | "check_in_reminder";
  recipientId: string;
  recipientEmail: string;
  data: Record<string, unknown>;
}

export type JobData = EmailJobData | NotificationJobData;

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential" as const,
    delay: 1000,
  },
  removeOnComplete: {
    count: 100,
    age: 24 * 60 * 60,
  },
  removeOnFail: {
    count: 500,
    age: 7 * 24 * 60 * 60,
  },
};

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

let emailQueue: Queue<EmailJobData> | null = null;
let notificationQueue: Queue<NotificationJobData> | null = null;
let emailQueueEvents: QueueEvents | null = null;

export function getEmailQueue(): Queue<EmailJobData> | null {
  const connection = getRedisConnection();
  if (!connection) {
    return null;
  }

  if (!emailQueue) {
    emailQueue = new Queue<EmailJobData>("email", {
      connection,
      defaultJobOptions,
    });

    emailQueueEvents = new QueueEvents("email", { connection });

    emailQueueEvents.on("completed", ({ jobId }) => {
      logger.debug({ jobId }, "Email job completed");
    });

    emailQueueEvents.on("failed", ({ jobId, failedReason }) => {
      logger.error({ jobId, failedReason }, "Email job failed");
    });
  }

  return emailQueue;
}

export function getNotificationQueue(): Queue<NotificationJobData> | null {
  const connection = getRedisConnection();
  if (!connection) {
    return null;
  }

  if (!notificationQueue) {
    notificationQueue = new Queue<NotificationJobData>("notification", {
      connection,
      defaultJobOptions,
    });
  }

  return notificationQueue;
}

export async function addEmailJob(data: EmailJobData, priority: number = 0): Promise<string | null> {
  const queue = getEmailQueue();
  if (!queue) {
    logger.warn("Email queue not available, email will be sent synchronously");
    return null;
  }

  const job = await queue.add("send-email", data, { priority });
  logger.info({ jobId: job.id, to: data.to, subject: data.subject }, "Email job added to queue");
  return job.id ?? null;
}

export async function addNotificationJob(
  data: NotificationJobData,
  delay?: number
): Promise<string | null> {
  const queue = getNotificationQueue();
  if (!queue) {
    logger.warn("Notification queue not available");
    return null;
  }

  const job = await queue.add("send-notification", data, { delay });
  logger.info({ jobId: job.id, type: data.type }, "Notification job added to queue");
  return job.id ?? null;
}

export async function closeQueues(): Promise<void> {
  const closePromises: Promise<void>[] = [];

  if (emailQueue) {
    closePromises.push(emailQueue.close());
  }
  if (notificationQueue) {
    closePromises.push(notificationQueue.close());
  }
  if (emailQueueEvents) {
    closePromises.push(emailQueueEvents.close());
  }

  await Promise.all(closePromises);

  emailQueue = null;
  notificationQueue = null;
  emailQueueEvents = null;

  logger.info("All queues closed");
}
