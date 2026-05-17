import { randomInt } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";
import { sendSMS } from "./twilioService.js";

const OTP_EXPIRY_MINUTES = 10;

export function generateOTP(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export type SendOTPResult =
  | { sent: true }
  | { sent: false; devOtp?: string };

export async function sendOTP(phone: string): Promise<SendOTPResult> {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otpCode.updateMany({
    where: { phone, used: false },
    data: { used: true },
  });

  await prisma.otpCode.create({
    data: { phone, code, expiresAt },
  });

  if (!env.TWILIO_ACCOUNT_SID) {
    logger.warn("[OTP] Twilio not configured - OTP not sent via SMS");
    if (env.NODE_ENV === "development") {
      logger.info(`[OTP DEV] Code for ${phone}: ${code}`);
      return { sent: false, devOtp: code };
    }
    return { sent: false };
  }

  await sendSMS(phone, `Your SchoolSetu verification code is: ${code}. Valid for 10 minutes.`);
  return { sent: true };
}

export async function verifyOTP(phone: string, code: string): Promise<boolean> {
  const record = await prisma.otpCode.findFirst({
    where: {
      phone,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { expiresAt: "desc" },
  });

  if (!record) return false;

  await prisma.otpCode.update({
    where: { id: record.id },
    data: { used: true },
  });

  return true;
}
