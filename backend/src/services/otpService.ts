import { randomInt } from "node:crypto";
import { OtpType } from "../generated/prisma/index.js";
import { prisma } from "../config/prisma.js";

const OTP_EXPIRY_MINUTES_DEFAULT = 10;

export function generateOTP(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * Invalidate prior unused OTPs for this identifier+type, persist a fresh code.
 */
export async function persistOtpCode(
  identifier: string,
  type: OtpType,
  expiryMinutes: number = OTP_EXPIRY_MINUTES_DEFAULT
): Promise<string> {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  await prisma.otpCode.updateMany({
    where: { identifier, type, used: false },
    data: { used: true },
  });

  await prisma.otpCode.create({
    data: {
      identifier,
      code,
      type,
      expiresAt,
    },
  });

  return code;
}

export async function verifyAndConsumeOtp(
  identifier: string,
  type: OtpType,
  code: string
): Promise<boolean> {
  const record = await prisma.otpCode.findFirst({
    where: {
      identifier,
      type,
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
