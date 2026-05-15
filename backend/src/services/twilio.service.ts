import twilio from "twilio";
import { env } from "../config/env.js";

export class TwilioService {
  private client =
    env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
      ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
      : null;

  async sendSmsOtp(phone: string, otp: string) {
    if (!this.client || !env.TWILIO_PHONE_NUMBER) {
      return { skipped: true, reason: "Twilio SMS credentials not configured", phone, otp };
    }

    return this.client.messages.create({
      to: phone,
      from: env.TWILIO_PHONE_NUMBER,
      body: `Your SchoolSetu OTP is ${otp}`
    });
  }

  async sendWhatsAppMessage(phone: string, body: string) {
    if (!this.client || !env.TWILIO_WHATSAPP_NUMBER) {
      return { skipped: true, reason: "Twilio WhatsApp credentials not configured", phone, body };
    }

    return this.client.messages.create({
      to: `whatsapp:${phone}`,
      from: `whatsapp:${env.TWILIO_WHATSAPP_NUMBER}`,
      body
    });
  }
}

export const twilioService = new TwilioService();
