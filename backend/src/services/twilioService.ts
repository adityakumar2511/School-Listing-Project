import twilio from "twilio";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

export const isTwilioConfigured = Boolean(
  env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_PHONE_NUMBER,
);

const client =
  isTwilioConfigured && env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
    ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
    : null;

export async function sendSMS(to: string, body: string): Promise<void> {
  if (!isTwilioConfigured || !client) {
    logger.warn("[Twilio] SMS skipped - not configured");
    return;
  }

  try {
    await client.messages.create({
      to,
      from: env.TWILIO_PHONE_NUMBER,
      body,
    });
  } catch (error) {
    logger.error("[Twilio] SMS send failed", {
      to,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  if (!isTwilioConfigured || !client) {
    logger.warn("[Twilio] WhatsApp skipped - not configured");
    return;
  }

  if (!env.TWILIO_WHATSAPP_NUMBER) {
    logger.warn("[Twilio] WhatsApp skipped - TWILIO_WHATSAPP_NUMBER not set");
    return;
  }

  try {
    await client.messages.create({
      from: `whatsapp:${env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`,
      body,
    });
  } catch (error) {
    logger.error("[Twilio] WhatsApp send failed", {
      to,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
