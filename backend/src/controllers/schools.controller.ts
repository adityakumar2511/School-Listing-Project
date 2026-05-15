import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { findSchoolBySlug, findSchools } from "../data/mock-schools.js";
import { resendService } from "../services/resend.service.js";
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
  sort: z.enum(["relevance", "fee-asc", "fee-desc"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12)
});

const createSchoolSchema = z.object({
  name: z.string().trim().min(2),
  contactPersonName: z.string().trim().min(2).optional(),
  phone: z.string().trim().min(10).optional(),
  city: z.string().trim().min(1),
  board: z.string().trim().optional(),
  type: z.string().trim().optional(),
  medium: z.string().trim().optional(),
  description: z.string().trim().optional()
});

const updateSchoolSchema = z.record(z.string(), z.unknown());

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function last10Digits(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

async function uniqueSchoolSlug(base: string) {
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

async function assertSchoolAccess(user: Express.Request["user"], schoolId: string) {
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
  if (!school) {
    throw new HttpError(404, "School not found");
  }

  response.json({ data: school });
});

export const createSchool = asyncHandler(async (request, response) => {
  const body = createSchoolSchema.parse(request.body);
  const city = await resolveCity(body.city);

  if (!city) {
    throw new HttpError(400, "City not found");
  }

  const boardSlug = body.board ? slugify(body.board.replaceAll("_", "-")) : "cbse";
  const board =
    (await prisma.board.findFirst({
      where: {
        OR: [{ slug: boardSlug }, { name: { equals: body.board ?? "CBSE", mode: "insensitive" } }]
      }
    })) ?? (await prisma.board.findUnique({ where: { slug: "cbse" } }));

  if (!board) {
    throw new HttpError(400, "Board not found");
  }

  const slug = await uniqueSchoolSlug(body.name);
  const phoneDigits = body.phone ? last10Digits(body.phone) : "";

  const school = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const created = await tx.school.create({
      data: {
        name: body.name,
        slug,
        cityId: city.id,
        stateId: city.stateId,
        boardId: board.id,
        type: body.type ?? "Co-ed",
        medium: body.medium ?? "English",
        description:
          body.description ??
          `${body.name} registration submitted via SchoolSetu. Our team will verify details before publishing.`,
        status: "pending"
      }
    });

    await tx.schoolDetails.create({
      data: {
        schoolId: created.id,
        principalName: body.contactPersonName,
        phone: phoneDigits ? `+91${phoneDigits}` : undefined,
        whatsapp: phoneDigits ? `+91${phoneDigits}` : undefined
      }
    });

    await tx.schoolAddress.create({
      data: {
        schoolId: created.id,
        addressLine: "Address pending verification",
        city: city.name,
        state: city.state.name,
        pincode: "000000"
      }
    });

    await tx.schoolAcademics.create({
      data: {
        schoolId: created.id,
        streams: [],
        classesFrom: "Nursery",
        classesTo: "XII",
        admissionOpen: false,
        documentsRequired: []
      }
    });

    await tx.schoolFees.create({
      data: { schoolId: created.id }
    });

    await tx.schoolFacilities.create({
      data: { schoolId: created.id }
    });

    return created;
  });

  const notifyEmail = process.env.SCHOOL_REGISTRATION_EMAIL ?? "admin@schoolsetu.example";
  await resendService.sendMail(
    notifyEmail,
    `New school registration: ${school.name}`,
    `<p><strong>${school.name}</strong> submitted a listing from ${city.name}.</p><p>Status: pending moderation.</p>`
  );

  response.status(201).json({
    message: "School registration submitted for moderation",
    data: school
  });
});

export const updateSchool = asyncHandler(async (request, response) => {
  if (!request.user) {
    throw new HttpError(401, "Authentication required");
  }

  const schoolId = String(request.params.id);
  await assertSchoolAccess(request.user, schoolId);

  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    throw new HttpError(404, "School not found");
  }

  const newValue = updateSchoolSchema.parse(request.body);

  const pendingUpdate = await prisma.pendingUpdate.create({
    data: {
      schoolId,
      fieldType: "profile",
      oldValue: {
        name: school.name,
        description: school.description,
        type: school.type,
        medium: school.medium
      },
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

export const getSchoolInquiries = asyncHandler(async (request, response) => {
  const schoolId = String(request.params.id);
  await assertSchoolAccess(request.user, schoolId);

  const inquiries = await prisma.inquiry.findMany({
    where: { schoolId },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true
        }
      },
      notes: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  response.json({
    data: inquiries,
    schoolId
  });
});
