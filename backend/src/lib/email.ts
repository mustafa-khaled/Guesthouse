import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type { Transporter } from "nodemailer";

let transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  const from = process.env.SMTP_EMAIL_FROM || user;

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
  html: string
): Promise<boolean> {
  const config = getTransporter();
  if (!config) {
    console.warn("SMTP configuration is incomplete; email not sent.");
    return false;
  }

  try {
    await config.transporter.sendMail({
      from: config.from,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
