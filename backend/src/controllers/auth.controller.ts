import bcrypt from "bcrypt";
import type { Request } from "express";
import jwt from "jsonwebtoken";
import { OtpType, type Prisma, type UserRole } from "../generated/prisma/index.js";
import { z } from "zod";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { prisma } from "../config/prisma.js";
import { createAuditLog } from "../services/audit.service.js";
import { persistOtpCode, verifyAndConsumeOtp } from "../services/otpService.js";
import { resendService } from "../services/resend.service.js";
import { smtpEmailService } from "../services/smtp.service.js";
import { sendSMS } from "../services/twilioService.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";
import {
  last10Digits,
  notifyAdminOfNewSchool,
  resolveCityAndState,
  slugify,
  uniqueSchoolSlug,
} from "./schools.controller.js";

const JWT_EXPIRES = "7d";
const SALT_ROUNDS = 10;

const PHONE_REGEX = /^\+91[6-9]\d{9}$/;

const registerParentSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().trim().optional(),
});

const registerSchoolSchema = z.object({
  ownerName: z.string().trim().min(1, "Owner name is required"),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().trim(),
  schoolName: z.string().trim().min(2, "School name is required"),
  address: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  board: z.array(z.string().trim().min(1)).min(1, "At least one board is required"),
  schoolType: z.string().trim().min(1, "School type is required"),
  description: z.string().trim().min(1, "Description is required"),
  established: z.coerce.number().int().min(1800).max(new Date().getFullYear()),
  principalName: z.string().trim().min(1, "Principal name is required"),
  website: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+/i.test(val), {
      message: "Website must be a valid http(s) URL",
    }),
});

const verifyEmailOtpSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  otp: z.string().trim().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const sendPhoneOtpSchema = z.object({
  phone: z.string().trim(),
});

const verifyPhoneOtpSchema = z.object({
  phone: z.string().trim(),
  otp: z.string().trim().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email"),
});

const resetPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  otp: z.string().trim().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

const googleAuthSchema = z.object({
  googleId: z.string().min(1, "googleId is required"),
  email: z.string().trim().email("Invalid email"),
  name: z.string().optional(),
});

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function optionalPhone(raw: string | undefined) {
  const p = raw?.trim();
  if (!p) return undefined;
  if (!PHONE_REGEX.test(p)) throw new HttpError(400, "Invalid phone number");
  return p;
}

type TokenUserPayload = {
  id: string;
  role: UserRole;
  email: string | null;
  phone: string | null;
  name: string | null;
};

function signJwt(user: TokenUserPayload) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
      name: user.name,
    },
    env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

async function dispatchEmailOtp(email: string, subject: string, code: string) {
  const html = `<p>Your SchoolSetu code is:</p><p style="font-size:20px;"><strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`;

  if (smtpEmailService.isConfigured()) {
    try {
      await smtpEmailService.sendHtml({ to: email, subject, html });
      return;
    } catch (err) {
      logger.error("[Auth] SMTP send failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const result = await resendService.sendMail(email, subject, html);
  if (!("skipped" in result && result.skipped)) {
    return;
  }

  if (env.NODE_ENV === "development") {
    console.log(`[DEV EMAIL OTP] To: ${email} OTP: ${code}`);
  } else {
    logger.info("[Auth] Email OTP not sent — configure SMTP or RESEND_API_KEY");
  }
}

export const registerParent = asyncHandler(async (request, response) => {
  const body = registerParentSchema.parse(request.body);
  const emailNorm = normalizeEmail(body.email);

  const phone = optionalPhone(body.phone);

  const existing = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (existing) throw new HttpError(409, "An account with this email already exists");

  if (phone) {
    const phoneUser = await prisma.user.findUnique({ where: { phone } });
    if (phoneUser) throw new HttpError(409, "This phone number is already registered");
  }

  const passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);

  await prisma.user.create({
    data: {
      email: emailNorm,
      name: body.name.trim(),
      passwordHash,
      phone,
      role: "parent",
      isEmailVerified: false,
    },
  });

  const code = await persistOtpCode(emailNorm, OtpType.EMAIL_VERIFY);
  await dispatchEmailOtp(emailNorm, "Verify your SchoolSetu email", code);

  response.status(201).json({ message: "OTP sent to email" });
});

export const registerSchool = asyncHandler(async (request, response) => {
  const body = registerSchoolSchema.parse(request.body);
  const emailNorm = normalizeEmail(body.email);
  const phone = optionalPhone(body.phone);
  if (!phone) throw new HttpError(400, "Phone number is required");

  const existingEmail = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (existingEmail) throw new HttpError(409, "An account with this email already exists");

  const phoneUser = await prisma.user.findUnique({ where: { phone } });
  if (phoneUser) throw new HttpError(409, "This phone number is already registered");

  const city = await resolveCityAndState(body.city, body.state);
  if (!city) {
    throw new HttpError(
      400,
      "City or state not found — check spelling or choose from supported locations",
    );
  }

  let boardRecord = null as Awaited<ReturnType<typeof prisma.board.findFirst>>;
  for (const b of body.board) {
    const boardSlug = slugify(b.replaceAll("_", "-"));
    boardRecord = await prisma.board.findFirst({
      where: {
        OR: [
          { slug: boardSlug },
          { name: { equals: b.trim(), mode: "insensitive" } },
        ],
      },
    });
    if (boardRecord) break;
  }
  if (!boardRecord) throw new HttpError(400, "No matching board — use a supported board name");

  const slug = await uniqueSchoolSlug(body.schoolName.trim());
  const passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);
  const phoneDigits = last10Digits(phone);
  const normalizedPhone = `+91${phoneDigits}`;
  const normalizedWhatsapp = normalizedPhone;
  const website =
    body.website && body.website.length > 0 ? body.website.trim() : undefined;

  const boardId = boardRecord.id;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const user = await tx.user.create({
      data: {
        email: emailNorm,
        name: body.ownerName.trim(),
        passwordHash,
        phone,
        role: "school",
        isEmailVerified: false,
      },
    });

    const created = await tx.school.create({
      data: {
        name: body.schoolName.trim(),
        slug,
        cityId: city.id,
        stateId: city.stateId,
        boardId,
        ownerId: user.id,
        type: body.schoolType.trim(),
        medium: "English",
        description: body.description.trim(),
        status: "pending",
      },
    });

    await tx.schoolDetails.create({
      data: {
        schoolId: created.id,
        principalName: body.principalName.trim(),
        establishedYear: body.established,
        phone: normalizedPhone,
        whatsapp: normalizedWhatsapp,
        email: emailNorm,
        website,
      },
    });

    await tx.schoolAddress.create({
      data: {
        schoolId: created.id,
        addressLine: body.address.trim(),
        city: city.name,
        state: city.state.name,
        pincode: "",
      },
    });

    await tx.schoolFees.create({
      data: { schoolId: created.id },
    });

    await tx.schoolFacilities.create({
      data: { schoolId: created.id },
    });

    await tx.schoolAcademics.create({
      data: {
        schoolId: created.id,
        streams: [],
        classesFrom: "Nursery",
        classesTo: "XII",
        admissionOpen: false,
        documentsRequired: [],
      },
    });
  });

  const code = await persistOtpCode(emailNorm, OtpType.EMAIL_VERIFY);
  await dispatchEmailOtp(emailNorm, "Verify your SchoolSetu email", code);

  void notifyAdminOfNewSchool(body.schoolName.trim(), city.name, normalizedPhone).catch((err) =>
    console.error("[Auth] admin notification failed:", err),
  );

  response.status(201).json({
    message: "School registered. Verify email then wait for admin approval.",
  });
});

export const verifyEmailOtp = asyncHandler(async (request, response) => {
  const body = verifyEmailOtpSchema.parse(request.body);
  const emailNorm = normalizeEmail(body.email);

  const user = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (!user) throw new HttpError(404, "No account found for this email");

  const ok = await verifyAndConsumeOtp(emailNorm, OtpType.EMAIL_VERIFY, body.otp);
  if (!ok) throw new HttpError(400, "Invalid or expired OTP");

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true },
    select: { id: true, role: true, email: true, phone: true, name: true },
  });

  const token = signJwt(updated);
  response.json({ token });
});

export const login = asyncHandler(async (request, response) => {
  const body = loginSchema.parse(request.body);
  const emailNorm = normalizeEmail(body.email);

  const user = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (!user?.passwordHash) throw new HttpError(401, "Invalid email or password");

  if (!user.isEmailVerified) {
    throw new HttpError(403, "Please verify your email before logging in");
  }

  const match = await bcrypt.compare(body.password, user.passwordHash);
  if (!match) throw new HttpError(401, "Invalid email or password");

  const token = signJwt({
    id: user.id,
    role: user.role,
    email: user.email ?? null,
    phone: user.phone ?? null,
    name: user.name ?? null,
  });

  response.json({ token });

  await maybeLogAdminLogin(user, request);
});

async function maybeLogAdminLogin(user: TokenUserPayload, request: Request) {
  if (user.role !== "admin") return;
  try {
    const forwarded = request.headers["x-forwarded-for"];
    await createAuditLog({
      actorId: user.id,
      actorEmail: user.email ?? undefined,
      actorRole: user.role,
      action: "ADMIN_LOGIN",
      targetType: "Auth",
      targetId: user.id,
      targetName: user.email ?? user.phone ?? user.id,
      ipAddress: request.ip ?? (Array.isArray(forwarded) ? forwarded[0] : forwarded) ?? undefined,
      userAgent: request.headers["user-agent"],
    });
  } catch (err) {
    logger.error("[Auth] ADMIN_LOGIN audit log failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export const sendPhoneOtpForLogin = asyncHandler(async (request, response) => {
  const body = sendPhoneOtpSchema.parse(request.body);

  if (!PHONE_REGEX.test(body.phone)) {
    response.status(400).json({ error: "Invalid phone number" });
    return;
  }

  const otp = await persistOtpCode(body.phone, OtpType.PHONE_LOGIN);

  if (process.env.TWILIO_ACCOUNT_SID) {
    await sendSMS(
      body.phone,
      `Your SchoolSetu verification code is: ${otp}. Valid for 10 minutes.`
    );
  } else {
    console.log(`[DEV OTP] Phone: ${body.phone} OTP: ${otp}`);
  }

  response.json({ message: "OTP sent", devMode: true });
});

export const verifyPhoneOtpForLogin = asyncHandler(async (request, response) => {
  const body = verifyPhoneOtpSchema.parse(request.body);

  if (!PHONE_REGEX.test(body.phone)) {
    response.status(400).json({ error: "Invalid phone number" });
    return;
  }

  const ok = await verifyAndConsumeOtp(body.phone, OtpType.PHONE_LOGIN, body.otp);
  if (!ok) {
    response.status(400).json({ error: "Invalid or expired OTP" });
    return;
  }

  const user = await prisma.user.upsert({
    where: { phone: body.phone },
    create: {
      phone: body.phone,
      role: "parent",
      name: "",
      isPhoneVerified: true,
    },
    update: { isPhoneVerified: true },
    select: { id: true, role: true, email: true, phone: true, name: true },
  });

  const token = signJwt(user);
  response.json({ token });

  if (user.role === "admin") {
    await maybeLogAdminLogin(
      {
        id: user.id,
        role: user.role,
        email: user.email ?? null,
        phone: user.phone ?? null,
        name: user.name ?? null,
      },
      request
    );
  }
});

export const forgotPassword = asyncHandler(async (request, response) => {
  const body = forgotPasswordSchema.parse(request.body);
  const emailNorm = normalizeEmail(body.email);

  const user = await prisma.user.findUnique({ where: { email: emailNorm } });

  const message = { message: "Reset OTP sent" as const };

  if (!user) {
    response.json(message);
    return;
  }

  const code = await persistOtpCode(emailNorm, OtpType.PASSWORD_RESET);
  await dispatchEmailOtp(emailNorm, "Reset your SchoolSetu password", code);

  response.json(message);
});

export const resetPassword = asyncHandler(async (request, response) => {
  const body = resetPasswordSchema.parse(request.body);
  const emailNorm = normalizeEmail(body.email);

  const user = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (!user) throw new HttpError(404, "No account found for this email");

  const ok = await verifyAndConsumeOtp(emailNorm, OtpType.PASSWORD_RESET, body.otp);
  if (!ok) throw new HttpError(400, "Invalid or expired OTP");

  const passwordHash = await bcrypt.hash(body.newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  response.json({ message: "Password reset successful" });
});

export const googleAuth = asyncHandler(async (request, response) => {
  const body = googleAuthSchema.parse(request.body);
  const emailNorm = normalizeEmail(body.email);

  const existingByGoogleId = await prisma.user.findUnique({ where: { googleId: body.googleId } });

  const sel = { id: true, role: true, email: true, phone: true, name: true } as const;

  let user;
  if (existingByGoogleId) {
    user = await prisma.user.update({
      where: { id: existingByGoogleId.id },
      data: {
        email: emailNorm,
        name: body.name ?? existingByGoogleId.name,
        isEmailVerified: true,
      },
      select: sel,
    });
  } else {
    const byEmail = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (byEmail) {
      user = await prisma.user.update({
        where: { id: byEmail.id },
        data: {
          googleId: body.googleId,
          name: body.name ?? byEmail.name,
          isEmailVerified: true,
        },
        select: sel,
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: emailNorm,
          name: body.name,
          googleId: body.googleId,
          role: "parent",
          isEmailVerified: true,
        },
        select: sel,
      });
    }
  }

  const token = signJwt(user);
  response.json({ token });
});
