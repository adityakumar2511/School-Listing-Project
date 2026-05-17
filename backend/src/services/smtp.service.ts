import nodemailer from "nodemailer";
import { env } from "../config/env.js";

function isSmtpConfigured(): boolean {
  return Boolean(
    env.SMTP_HOST &&
      env.SMTP_PORT &&
      env.SMTP_USER !== undefined &&
      env.SMTP_USER !== "" &&
      env.SMTP_PASS !== undefined &&
      env.SMTP_PASS !== ""
  );
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export const smtpEmailService = {
  isConfigured(): boolean {
    return isSmtpConfigured();
  },

  async sendHtml(options: { to: string; subject: string; html: string }): Promise<void> {
    if (!isSmtpConfigured()) {
      throw new Error("SMTP is not configured");
    }
    const t = getTransporter();
    await t.sendMail({
      from: `"SchoolSetu" <${env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  },
};
