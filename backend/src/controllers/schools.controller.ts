import type { Prisma } from "../generated/prisma/index.js";
import { z } from "zod";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { prisma } from "../config/prisma.js";
import { findSchoolBySlug, findSchools } from "../data/mock-schools.js";
import { resendService } from "../services/resend.service.js";
import { sendWhatsApp } from "../services/twilioService.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";

const listQuerySchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  board: z.string().optional(),
  facility: z.string().optional(),
  category: z.string().optional(),
  featured: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((value) => value === "true"),
  admissionOpen: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((value) => value === "true"),
  sort: z.enum(["relevance", "fee-asc", "fee-desc", "newest"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(12)
});

const createSchoolSchema = z.object({
  // Step 1 — Basic
  name: z.string().trim().min(2, "School name is required"),
  city: z.string().trim().min(1, "City is required"),
  board: z.string().trim().min(1, "Board is required"),
  type: z.string().trim().optional(),
  medium: z.string().trim().optional(),
  establishedYear: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional(),
  description: z.string().trim().optional(),

  // Step 2 — Contact + Address
  principalName: z.string().trim().optional(),
  phone: z.string().trim().min(10, "Phone number is required"),
  whatsapp: z.string().trim().optional(),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  addressLine: z.string().trim().optional(),
  pincode: z.string().trim().optional(),

  // Step 3 — Fees + Academics
  monthlyFee: z.coerce.number().int().nonnegative().optional(),
  admissionFee: z.coerce.number().int().nonnegative().optional(),
  classesFrom: z.string().trim().optional(),
  classesTo: z.string().trim().optional(),
  admissionOpen: z.coerce.boolean().optional(),

  // Step 4 — Facilities (all optional booleans)
  facilities: z
    .object({
      library: z.boolean().optional(),
      labs: z.boolean().optional(),
      hostel: z.boolean().optional(),
      transport: z.boolean().optional(),
      smartClassroom: z.boolean().optional(),
      wifi: z.boolean().optional(),
      cctv: z.boolean().optional(),
      gym: z.boolean().optional(),
      swimmingPool: z.boolean().optional(),
      playground: z.boolean().optional(),
      auditorium: z.boolean().optional(),
      cafeteria: z.boolean().optional(),
    })
    .optional(),
});

const updateSchoolSchema = z.record(z.string(), z.unknown());

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function last10Digits(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

export async function uniqueSchoolSlug(base: string) {
  let slug = slugify(base);
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const existing = await prisma.school.findUnique({ where: { slug: candidate } });
    if (!existing) {
      return candidate;
    }
    suffix += 1;
  }
}

async function resolveCity(cityValue: string) {
  const normalized = cityValue.trim();
  return prisma.city.findFirst({
    where: {
      OR: [
        { slug: slugify(normalized) },
        { name: { equals: normalized, mode: "insensitive" } }
      ]
    },
    include: {
      state: true
    }
  });
}

/** Resolve a city within a specific state (for registration / stricter matching). */
export async function resolveCityAndState(cityValue: string, stateValue: string) {
  const stateNorm = stateValue.trim();
  const cityNorm = cityValue.trim();

  const state = await prisma.state.findFirst({
    where: {
      OR: [
        { slug: slugify(stateNorm) },
        { name: { equals: stateNorm, mode: "insensitive" } },
      ],
    },
  });
  if (!state) return null;

  return prisma.city.findFirst({
    where: {
      stateId: state.id,
      OR: [
        { slug: slugify(cityNorm) },
        { name: { equals: cityNorm, mode: "insensitive" } },
      ],
    },
    include: { state: true },
  });
}

export async function assertSchoolAccess(user: Express.Request["user"], schoolId: string) {
  if (!user) {
    throw new HttpError(401, "Authentication required");
  }

  if (user.role === "admin") {
    return;
  }

  if (user.role !== "school") {
    throw new HttpError(403, "Insufficient permissions");
  }

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: { details: true }
  });

  if (!school) {
    throw new HttpError(404, "School not found");
  }

  if (school.ownerId === user.id) {
    return;
  }

  const userRecord = await prisma.user.findUnique({ where: { id: user.id } });
  const userPhone = userRecord?.phone ? last10Digits(userRecord.phone) : "";
  const schoolPhone = school.details?.phone
    ? last10Digits(school.details.phone)
    : school.details?.whatsapp
      ? last10Digits(school.details.whatsapp)
      : "";

  if (userPhone && schoolPhone && userPhone === schoolPhone) {
    return;
  }

  throw new HttpError(403, "You do not have permission to manage this school");
}

export const getMySchool = asyncHandler(async (request, response) => {
  if (!request.user) throw new HttpError(401, "Authentication required");

  const school = await prisma.school.findFirst({
    where: { ownerId: request.user.id },
    include: {
      details: true,
      address: true,
      fees: true,
      facilities: true,
      academics: true,
      gallery: { orderBy: { order: "asc" } },
      sections: { orderBy: { order: "asc" } },
    },
  });

  if (!school) throw new HttpError(404, "No school registered to your account");

  const established = school.details?.establishedYear ?? null;
  const principalName = school.details?.principalName ?? null;
  const website = school.details?.website ?? null;

  response.json({
    data: {
      ...school,
      status: school.status,
      schoolName: school.name,
      schoolType: school.type,
      established,
      principalName,
      website,
    },
  });
});

export const listSchools = asyncHandler(async (request, response) => {
  const query = listQuerySchema.parse(request.query);
  const { data, total } = await findSchools(
    {
      q: query.q,
      city: query.city,
      board: query.board,
      facility: query.facility,
      category: query.category,
      featured: query.featured,
      admissionOpen: query.admissionOpen
    },
    query.page,
    query.limit,
    query.sort
  );

  response.json({
    data,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  });
});

export const getSchool = asyncHandler(async (request, response) => {
  const school = await findSchoolBySlug(String(request.params.slug));
  // Public endpoint: only approved schools are visible. Pending/rejected → 404.
  if (!school || school.status !== "approved") {
    throw new HttpError(404, "School not found");
  }

  response.json({ data: school });
});

export const createSchool = asyncHandler(async (request, response) => {
  if (!request.user) {
    throw new HttpError(401, "Authentication required");
  }

  const body = createSchoolSchema.parse(request.body);

  // Resolve city + board (both required)
  const city = await resolveCity(body.city);
  if (!city) {
    throw new HttpError(400, "City not found");
  }

  const boardSlug = slugify(body.board.replaceAll("_", "-"));
  const board = await prisma.board.findFirst({
    where: {
      OR: [{ slug: boardSlug }, { name: { equals: body.board, mode: "insensitive" } }],
    },
  });
  if (!board) {
    throw new HttpError(400, "Board not found");
  }

  // One owner = one school. Block re-registration.
  const existing = await prisma.school.findFirst({ where: { ownerId: request.user.id } });
  if (existing) {
    throw new HttpError(409, "You have already registered a school. Contact support to add another.");
  }

  const slug = await uniqueSchoolSlug(body.name);
  const phoneDigits = last10Digits(body.phone);
  const normalizedPhone = `+91${phoneDigits}`;
  const whatsappDigits = body.whatsapp ? last10Digits(body.whatsapp) : phoneDigits;
  const normalizedWhatsapp = `+91${whatsappDigits}`;
  const ownerId = request.user.id;
  const facilities = body.facilities ?? {};

  // ── All-or-nothing transaction ──────────────────────────────────────────────
  const school = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const created = await tx.school.create({
      data: {
        name: body.name,
        slug,
        cityId: city.id,
        stateId: city.stateId,
        boardId: board.id,
        ownerId,
        type: body.type ?? "Co-ed",
        medium: body.medium ?? "English",
        description:
          body.description ??
          `${body.name} — registration submitted via SchoolSetu, pending verification.`,
        status: "pending",
      },
    });

    await tx.schoolDetails.create({
      data: {
        schoolId: created.id,
        principalName: body.principalName,
        establishedYear: body.establishedYear,
        phone: normalizedPhone,
        whatsapp: normalizedWhatsapp,
        email: body.email && body.email !== "" ? body.email : undefined,
      },
    });

    await tx.schoolAddress.create({
      data: {
        schoolId: created.id,
        addressLine: body.addressLine ?? "Address pending verification",
        city: city.name,
        state: city.state.name,
        pincode: body.pincode ?? "",
      },
    });

    await tx.schoolFees.create({
      data: {
        schoolId: created.id,
        admissionFee: body.admissionFee,
        tuitionFeeMonthly: body.monthlyFee,
        tuitionFeeAnnual:
          body.monthlyFee !== undefined ? body.monthlyFee * 12 : undefined,
      },
    });

    await tx.schoolFacilities.create({
      data: {
        schoolId: created.id,
        library: facilities.library ?? false,
        labs: facilities.labs ?? false,
        hostel: facilities.hostel ?? false,
        transport: facilities.transport ?? false,
        smartClassroom: facilities.smartClassroom ?? false,
        wifi: facilities.wifi ?? false,
        cctv: facilities.cctv ?? false,
        gym: facilities.gym ?? false,
        swimmingPool: facilities.swimmingPool ?? false,
        playground: facilities.playground ?? false,
        auditorium: facilities.auditorium ?? false,
        cafeteria: facilities.cafeteria ?? false,
      },
    });

    await tx.schoolAcademics.create({
      data: {
        schoolId: created.id,
        streams: [],
        classesFrom: body.classesFrom ?? "Nursery",
        classesTo: body.classesTo ?? "XII",
        admissionOpen: body.admissionOpen ?? false,
        documentsRequired: [],
      },
    });

    return created;
  });

  try {
    await prisma.user.update({ where: { id: ownerId }, data: { role: "school" } });
  } catch (err) {
    logger.error("[Schools] failed to bump owner role to school after registration", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // ── Notifications (best-effort, never fail the request) ────────────────────
  void notifyAdminOfNewSchool(school.name, city.name, normalizedPhone).catch((err) =>
    console.error("[Schools] admin notification failed:", err)
  );

  response.status(201).json({
    message: "School registration submitted for moderation",
    data: school,
  });
});

export async function notifyAdminOfNewSchool(schoolName: string, cityName: string, phone: string) {
  const message = `New school registered on SchoolSetu: ${schoolName} (${cityName}). Contact: ${phone}. Pending review.`;

  // Email (Resend) — independent try/catch so a failure never blocks WhatsApp.
  try {
    const notifyEmail = env.SCHOOL_REGISTRATION_EMAIL ?? "admin@schoolsetu.example";
    await resendService.sendMail(
      notifyEmail,
      `New school registration: ${schoolName}`,
      `<p><strong>${schoolName}</strong> submitted a listing from ${cityName}.</p><p>Contact phone: ${phone}</p><p>Status: <strong>pending</strong> — review at <a href="${env.FRONTEND_URL}/admin/schools">/admin/schools</a></p>`,
    );
  } catch (err) {
    logger.error("[Schools] admin email notification failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // WhatsApp (Twilio) — only if ADMIN_NOTIFICATION_PHONE is configured.
  if (env.ADMIN_NOTIFICATION_PHONE) {
    try {
      await sendWhatsApp(env.ADMIN_NOTIFICATION_PHONE, message);
    } catch (err) {
      logger.error("[Schools] admin WhatsApp notification failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

export const updateSchool = asyncHandler(async (request, response) => {
  if (!request.user) {
    throw new HttpError(401, "Authentication required");
  }

  const schoolId = String(request.params.id);
  await assertSchoolAccess(request.user, schoolId);

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      details: true,
      address: true,
      fees: true,
      gallery: { orderBy: { order: "asc" } },
      sections: { orderBy: { order: "asc" } },
    },
  });
  if (!school) {
    throw new HttpError(404, "School not found");
  }

  const newValue = updateSchoolSchema.parse(request.body);

  const oldValue = {
    name: school.name,
    description: school.description,
    type: school.type,
    medium: school.medium,
    principalName: school.details?.principalName ?? null,
    phone: school.details?.phone ?? null,
    addressLine: school.address?.addressLine ?? null,
    pincode: school.address?.pincode ?? null,
    admissionFee: school.fees?.admissionFee ?? null,
    tuitionFeeMonthly: school.fees?.tuitionFeeMonthly ?? null,
    tuitionFeeAnnual: school.fees?.tuitionFeeAnnual ?? null,
    transportFee: school.fees?.transportFee ?? null,
    hostelFee: school.fees?.hostelFee ?? null,
    gallery: school.gallery.map((g) => ({
      id: g.id,
      cloudinaryUrl: g.cloudinaryUrl,
      order: g.order,
      type: g.type,
    })),
    sections: school.sections.map((s) => ({
      id: s.id,
      title: s.title,
      content: s.content,
      sectionType: s.sectionType,
      order: s.order,
    })),
  };

  const pendingUpdate = await prisma.pendingUpdate.create({
    data: {
      schoolId,
      fieldType: "profile",
      oldValue: oldValue as Prisma.InputJsonValue,
      newValue: newValue as Prisma.InputJsonValue,
      submittedBy: request.user.id,
      status: "pending"
    }
  });

  response.json({
    message: "Update submitted to moderation queue",
    pendingUpdate
  });
});
