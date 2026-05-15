import { randomInt } from "node:crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { twilioService } from "../services/twilio.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_SENDS_PER_WINDOW = 3;
const OTP_SEND_WINDOW_MINUTES = 10;
const MAX_VERIFY_ATTEMPTS = 5;

const sendOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s/g, ""))
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length === 10 || (digits.length === 12 && digits.startsWith("91"));
    }, "Phone must be a valid 10-digit Indian number")
});

const verifyOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s/g, "")),
  otp: z.string().trim().regex(/^\d{6}$/, "OTP must be a 6-digit code")
});

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  return phone.startsWith("+") ? phone : `+${digits}`;
}

export const sendOtp = asyncHandler(async (request, response) => {
  const body = sendOtpSchema.parse(request.body);
  const phone = normalizePhone(body.phone);
  const windowStart = new Date(Date.now() - OTP_SEND_WINDOW_MINUTES * 60 * 1000);

  const recentSends = await prisma.otpRecord.count({
    where: {
      phone,
      createdAt: {
        gte: windowStart
      }
    }
  });

  if (recentSends >= MAX_OTP_SENDS_PER_WINDOW) {
    throw new HttpError(429, "Too many OTP requests. Please try again after 10 minutes.");
  }

  const otp = String(randomInt(100000, 1_000_000));
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.$transaction([
    prisma.otpRecord.updateMany({
      where: {
        phone,
        used: false
      },
      data: {
        used: true,
        usedAt: new Date()
      }
    }),
    prisma.otpRecord.create({
      data: {
        phone,
        otp,
        expiresAt,
        attempts: 0
      }
    })
  ]);

  await twilioService.sendSmsOtp(phone, otp);

  response.json({ success: true, message: "OTP sent" });
});

export const verifyOtp = asyncHandler(async (request, response) => {
  const body = verifyOtpSchema.parse(request.body);
  const phone = normalizePhone(body.phone);

  const activeOtp = await prisma.otpRecord.findFirst({
    where: {
      phone,
      used: false,
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!activeOtp) {
    throw new HttpError(400, "Invalid or expired OTP", {
      remainingAttempts: 0
    });
  }

  if (activeOtp.attempts >= MAX_VERIFY_ATTEMPTS) {
    throw new HttpError(400, "Too many failed attempts. Request a new OTP.", {
      remainingAttempts: 0
    });
  }

  if (activeOtp.otp !== body.otp) {
    const updated = await prisma.otpRecord.update({
      where: { id: activeOtp.id },
      data: {
        attempts: {
          increment: 1
        }
      }
    });

    const remainingAttempts = Math.max(0, MAX_VERIFY_ATTEMPTS - updated.attempts);
    throw new HttpError(400, "Invalid OTP", {
      remainingAttempts
    });
  }

  const user = await prisma.$transaction(async (tx) => {
    const updateResult = await tx.otpRecord.updateMany({
      where: {
        id: activeOtp.id,
        used: false,
        otp: body.otp
      },
      data: {
        used: true,
        usedAt: new Date()
      }
    });

    if (updateResult.count !== 1) {
      throw new HttpError(401, "OTP already used");
    }

    return tx.user.upsert({
      where: {
        phone
      },
      update: {},
      create: {
        phone,
        role: "parent"
      }
    });
  });

  const token = jwt.sign(
    { id: user.id, role: user.role, phone: user.phone },
    env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );

  response.json({
    success: true,
    token,
    user: {
      id: user.id,
      phone: user.phone,
      role: user.role
    }
  });
});
