import { randomInt } from "node:crypto";
import type { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { createAuditLog } from "../services/audit.service.js";
import { twilioService } from "../services/twilio.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";

// ── Dev fallback: in-memory OTP store used when DB is unreachable ─────────────
const devOtpStore = new Map<string, { otp: string; expiresAt: Date }>();

function isDbUnreachable(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.constructor.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server"))
  );
}

const googleAuthSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  googleId: z.string().min(1, "googleId is required"),
});

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
  const otp = String(randomInt(100000, 1_000_000));
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  try {
    const windowStart = new Date(Date.now() - OTP_SEND_WINDOW_MINUTES * 60 * 1000);
    const recentSends = await prisma.otpRecord.count({
      where: { phone, createdAt: { gte: windowStart } }
    });

    if (recentSends >= MAX_OTP_SENDS_PER_WINDOW) {
      throw new HttpError(429, "Too many OTP requests. Please try again after 10 minutes.");
    }

    await prisma.$transaction([
      prisma.otpRecord.updateMany({
        where: { phone, used: false },
        data: { used: true, usedAt: new Date() }
      }),
      prisma.otpRecord.create({
        data: { phone, otp, expiresAt, attempts: 0 }
      })
    ]);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (!isDbUnreachable(error)) throw error;
    // DB unreachable — store OTP in memory for this session
    console.warn("[Auth] DB unreachable, using in-memory OTP store for", phone);
    devOtpStore.set(phone, { otp, expiresAt });
  }

  await twilioService.sendSmsOtp(phone, otp);
  response.json({ success: true, message: "OTP sent" });
});

export const verifyOtp = asyncHandler(async (request, response) => {
  const body = verifyOtpSchema.parse(request.body);
  const phone = normalizePhone(body.phone);

  // ── Primary path: DB available ─────────────────────────────────────────────
  try {
    const activeOtp = await prisma.otpRecord.findFirst({
      where: { phone, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" }
    });

    if (!activeOtp) {
      throw new HttpError(400, "Invalid or expired OTP", { remainingAttempts: 0 });
    }
    if (activeOtp.attempts >= MAX_VERIFY_ATTEMPTS) {
      throw new HttpError(400, "Too many failed attempts. Request a new OTP.", { remainingAttempts: 0 });
    }
    if (activeOtp.otp !== body.otp) {
      const updated = await prisma.otpRecord.update({
        where: { id: activeOtp.id },
        data: { attempts: { increment: 1 } }
      });
      const remainingAttempts = Math.max(0, MAX_VERIFY_ATTEMPTS - updated.attempts);
      throw new HttpError(400, "Invalid OTP", { remainingAttempts });
    }

    const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updateResult = await tx.otpRecord.updateMany({
        where: { id: activeOtp.id, used: false, otp: body.otp },
        data: { used: true, usedAt: new Date() }
      });
      if (updateResult.count !== 1) throw new HttpError(401, "OTP already used");
      return tx.user.upsert({
        where: { phone },
        update: {},
        create: { phone, role: "parent" }
      });
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, phone: user.phone },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    if (user.role === "admin") {
      const forwarded = request.headers["x-forwarded-for"];
      await createAuditLog({
        actorId: user.id,
        actorEmail: user.phone ?? undefined,
        actorRole: user.role,
        action: "ADMIN_LOGIN",
        targetType: "Auth",
        targetId: user.id,
        targetName: user.phone ?? user.id,
        ipAddress: request.ip ?? (Array.isArray(forwarded) ? forwarded[0] : forwarded) ?? undefined,
        userAgent: request.headers["user-agent"],
      });
    }

    return response.json({
      success: true,
      token,
      user: { id: user.id, phone: user.phone, role: user.role }
    });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (!isDbUnreachable(error)) throw error;
    // Fall through to in-memory path
    console.warn("[Auth] DB unreachable, verifying OTP from in-memory store for", phone);
  }

  // ── Fallback path: DB unreachable, use in-memory store ────────────────────
  const stored = devOtpStore.get(phone);
  if (!stored || stored.expiresAt < new Date()) {
    throw new HttpError(400, "Invalid or expired OTP", { remainingAttempts: 0 });
  }
  if (stored.otp !== body.otp) {
    throw new HttpError(400, "Invalid OTP", { remainingAttempts: MAX_VERIFY_ATTEMPTS - 1 });
  }
  devOtpStore.delete(phone);

  const devUserId = `local-${phone.replace(/\D/g, "")}`;
  const token = jwt.sign(
    { id: devUserId, role: "parent", phone },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  response.json({
    success: true,
    token,
    user: { id: devUserId, phone, role: "parent" }
  });
});

/**
 * Called by the Next.js NextAuth route after Google OAuth completes.
 * Upserts the user by googleId (then falls back to email), signs a 7-day JWT,
 * and returns it so the frontend can store it alongside the NextAuth session.
 */
export const googleAuth = asyncHandler(async (request, response) => {
  const body = googleAuthSchema.parse(request.body);

  // ── Primary path: DB available ─────────────────────────────────────────────
  try {
    // Prefer lookup by googleId so repeat sign-ins are fast.
    // Fall back to email so an existing OTP-registered user gets their
    // account linked rather than a duplicate being created.
    const byGoogleId = await prisma.user.findFirst({ where: { googleId: body.googleId } });
    const byEmail = byGoogleId
      ? null
      : await prisma.user.findFirst({ where: { email: body.email } });

    let user;
    if (byGoogleId) {
      user = byGoogleId;
    } else if (byEmail) {
      user = await prisma.user.update({
        where: { id: byEmail.id },
        data: { googleId: body.googleId, name: body.name ?? byEmail.name ?? undefined },
      });
    } else {
      user = await prisma.user.create({
        data: { email: body.email, name: body.name, googleId: body.googleId, role: "parent" },
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, phone: user.phone },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return response.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    if (!isDbUnreachable(error)) throw error;
    console.warn("[Auth] DB unreachable, issuing Google auth token without persistence");
  }

  // ── Fallback path: issue token directly from Google profile ───────────────
  const devUserId = `google-${body.googleId}`;
  const token = jwt.sign(
    { id: devUserId, role: "parent", phone: null },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  response.json({
    success: true,
    token,
    user: { id: devUserId, email: body.email, role: "parent" },
  });
});
