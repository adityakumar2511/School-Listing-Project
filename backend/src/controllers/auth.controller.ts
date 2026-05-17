import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { prisma } from "../config/prisma.js";
import { createAuditLog } from "../services/audit.service.js";
import { sendOTP, verifyOTP } from "../services/otpService.js";
import { asyncHandler } from "../utils/async-handler.js";

const googleAuthSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  googleId: z.string().min(1, "googleId is required"),
  role: z.literal("school").optional(),
});

const PHONE_REGEX = /^\+91[6-9]\d{9}$/;

const sendOtpSchema = z.object({
  phone: z.string().trim(),
});

const verifyOtpSchema = z.object({
  phone: z.string().trim(),
  otp: z.string().trim().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
  role: z.literal("school").optional(),
});

export const sendOtp = asyncHandler(async (request, response) => {
  const body = sendOtpSchema.parse(request.body);

  if (!PHONE_REGEX.test(body.phone)) {
    response.status(400).json({ error: "Invalid phone number" });
    return;
  }

  const result = await sendOTP(body.phone);

  const payload: { success: true; message: string; devOtp?: string } = {
    success: true,
    message: "OTP sent",
  };

  if (env.NODE_ENV === "development" && "devOtp" in result && result.devOtp) {
    payload.devOtp = result.devOtp;
  }

  response.json(payload);
});

export const verifyOtp = asyncHandler(async (request, response) => {
  const body = verifyOtpSchema.parse(request.body);

  if (!PHONE_REGEX.test(body.phone)) {
    response.status(400).json({ error: "Invalid phone number" });
    return;
  }

  const ok = await verifyOTP(body.phone, body.otp);
  if (!ok) {
    response.status(400).json({ error: "Invalid or expired OTP" });
    return;
  }

  let user = await prisma.user.findUnique({ where: { phone: body.phone } });
  if (!user) {
    const role = body.role === "school" ? "school" : "parent";
    user = await prisma.user.create({
      data: { phone: body.phone, role, name: "" },
    });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, phone: user.phone },
    env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  // Send the response first so audit logging never blocks the user.
  response.json({
    token,
    user: { id: user.id, role: user.role, phone: user.phone },
  });

  if (user.role === "admin") {
    try {
      const forwarded = request.headers["x-forwarded-for"];
      await createAuditLog({
        actorId: user.id,
        actorEmail: user.phone ?? undefined,
        actorRole: user.role,
        action: "ADMIN_LOGIN",
        targetType: "Auth",
        targetId: user.id,
        targetName: user.phone ?? user.id,
        ipAddress:
          request.ip ?? (Array.isArray(forwarded) ? forwarded[0] : forwarded) ?? undefined,
        userAgent: request.headers["user-agent"],
      });
    } catch (err) {
      logger.error("[Auth] ADMIN_LOGIN audit log failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
});

/**
 * Called by the Next.js NextAuth route after Google OAuth completes.
 * Upserts the user by googleId (then falls back to email), signs a 7-day JWT.
 */
export const googleAuth = asyncHandler(async (request, response) => {
  const body = googleAuthSchema.parse(request.body);

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
    const role = body.role === "school" ? "school" : "parent";
    user = await prisma.user.create({
      data: { email: body.email, name: body.name, googleId: body.googleId, role },
    });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, phone: user.phone },
    env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  response.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
});
