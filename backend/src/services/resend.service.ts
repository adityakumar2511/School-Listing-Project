import { Resend } from "resend";
import { env } from "../config/env.js";

export class ResendService {
  private client = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

  async sendMail(to: string, subject: string, html: string) {
    if (!this.client) {
      return { skipped: true, reason: "Resend credentials not configured", to, subject };
    }

    return this.client.emails.send({
      from: "SchoolSetu <noreply@schoolsetu.example>",
      to,
      subject,
      html
    });
  }
}

export const resendService = new ResendService();
