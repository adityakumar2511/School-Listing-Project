import type { GalleryType, Prisma } from "../generated/prisma/index.js";
import { z } from "zod";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { prisma } from "../config/prisma.js";
import { createAuditLog, extractActor } from "../services/audit.service.js";
import { resendService } from "../services/resend.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";

function getChangedFields(
  previous: Record<string, unknown>,
  incoming: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const changed: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(incoming)) {
    if (previous[key] !== incoming[key]) {
      changed[key] = { from: previous[key], to: incoming[key] };
    }
  }
  return changed;
}

// ── Users ────────────────────────────────────────────────

export const listAdminUsers = asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
  res.json({ data: users });
});




export const listAdminSchools = asyncHandler(async (_req, res) => {
  const schools = await prisma.school.findMany({
    include: { city: true, board: true, details: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ data: schools });
});

const adminCreateSchoolSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  city: z.string().trim().min(1, "City is required"),
  board: z.string().trim().min(1, "Board is required"),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  monthlyFee: z.coerce.number().int().nonnegative().optional(),
});

export const adminCreateSchool = asyncHandler(async (req, res) => {
  const body = adminCreateSchoolSchema.parse(req.body);

  const city = await prisma.city.findFirst({
    where: { OR: [{ slug: body.city }, { name: { equals: body.city, mode: "insensitive" } }] },
    include: { state: true },
  });
  if (!city) throw new HttpError(400, "City not found");

  const board = await prisma.board.findFirst({
    where: { OR: [{ slug: body.board }, { name: { equals: body.board, mode: "insensitive" } }] },
  });
  if (!board) throw new HttpError(400, "Board not found");

  // Generate unique slug
  const baseSlug = body.name.toLowerCase().trim().replaceAll(/\s+/g, "-").replaceAll(/[^a-z0-9-]/g, "");
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.school.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const school = await prisma.school.create({
    data: {
      name: body.name,
      slug,
      cityId: city.id,
      stateId: city.state.id,
      boardId: board.id,
      type: "Co-ed",
      medium: "English",
      description: `${body.name} — verified school listed by admin.`,
      status: "approved",
    },
    include: { city: true, board: true },
  });

  if (body.phone || body.address || body.monthlyFee !== undefined) {
    await prisma.schoolDetails.create({
      data: {
        schoolId: school.id,
        phone: body.phone ?? undefined,
        whatsapp: body.phone ?? undefined,
      },
    });
  }

  if (body.address) {
    await prisma.schoolAddress.create({
      data: {
        schoolId: school.id,
        addressLine: body.address,
        city: city.name,
        state: city.state.name,
        pincode: "",
      },
    });
  }

  if (body.monthlyFee !== undefined) {
    await prisma.schoolFees.create({
      data: { schoolId: school.id, tuitionFeeMonthly: body.monthlyFee },
    });
  }

  await createAuditLog({
    actorId: req.user?.id ?? "system",
    actorRole: req.user?.role ?? "admin",
    action: "SCHOOL_CREATED",
    targetType: "School",
    targetId: school.id,
    targetName: school.name,
    newData: { name: school.name, city: city.name, board: board.name, status: "approved" },
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  res.status(201).json({ data: school });
});

async function notifySchoolOfModerationResult(
  schoolId: string,
  status: "approved" | "rejected",
  reason?: string,
) {
  try {
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: { details: true, owner: true },
    });
    if (!school) return;
    const email = school.details?.email ?? school.owner?.email;
    if (!email) return;

    if (env.NODE_ENV !== "production") {
      console.log(`[School moderation email] to=${email} status=${status} school=${school.name}`);
    }

    const subject =
      status === "approved"
        ? `Your school listing has been approved — ${school.name}`
        : `Update on your school listing — ${school.name}`;

    const html =
      status === "approved"
        ? `<p>Hi,</p><p>Great news! Your school <strong>${school.name}</strong> is now live on SchoolSetu.</p><p>You can manage inquiries from your <a href="${env.FRONTEND_URL}/school/dashboard">dashboard</a>.</p>`
        : `<p>Hi,</p><p>Your school listing <strong>${school.name}</strong> could not be approved at this time.</p>${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}<p>Please review the details and resubmit from your <a href="${env.FRONTEND_URL}/school/dashboard">dashboard</a>.</p>`;

    await resendService.sendMail(email, subject, html);
  } catch (err) {
    logger.error("[Admin] moderation email notification failed", {
      schoolId,
      status,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export const approveSchool = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const previous = await prisma.school.findUnique({
    where: { id },
    select: { id: true, name: true, status: true },
  });

  const school = await prisma.school.update({
    where: { id },
    data: { status: "approved" },
  });

  res.json({ message: "School approved", school });

  try {
    await createAuditLog({
      ...extractActor(req),
      action: "SCHOOL_VERIFIED",
      targetType: "School",
      targetId: school.id,
      targetName: school.name,
      previousData: { status: previous?.status },
      newData: { status: "approved" },
      notes: req.body.notes as string | undefined,
    });
  } catch (err) {
    logger.error("[Admin] SCHOOL_VERIFIED audit log failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  void notifySchoolOfModerationResult(school.id, "approved");
});

export const rejectSchool = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const previous = await prisma.school.findUnique({
    where: { id },
    select: { id: true, name: true, status: true },
  });

  const reason = req.body.reason as string | undefined;
  const school = await prisma.school.update({
    where: { id },
    data: { status: "rejected" },
  });

  res.json({ message: "School rejected", school });

  try {
    await createAuditLog({
      ...extractActor(req),
      action: "SCHOOL_REJECTED",
      targetType: "School",
      targetId: school.id,
      targetName: school.name,
      previousData: { status: previous?.status },
      newData: { status: "rejected" },
      notes: reason,
    });
  } catch (err) {
    logger.error("[Admin] SCHOOL_REJECTED audit log failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  void notifySchoolOfModerationResult(school.id, "rejected", reason);
});

export const editSchool = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const previous = await prisma.school.findUnique({
    where: { id },
  });

  if (!previous) {
    res.status(404).json({ message: "School not found" });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const school = await prisma.school.update({
    where: { id },
    data: body as Parameters<typeof prisma.school.update>[0]["data"],
  });

  await createAuditLog({
    ...extractActor(req),
    action: "SCHOOL_EDITED",
    targetType: "School",
    targetId: school.id,
    targetName: school.name,
    previousData: getChangedFields(
      previous as unknown as Record<string, unknown>,
      body
    ),
    newData: body,
  });

  res.json({ message: "School updated", school });
});

export const deleteSchool = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const school = await prisma.school.findUnique({
    where: { id },
    select: { id: true, name: true, status: true },
  });

  if (!school) {
    res.status(404).json({ message: "School not found" });
    return;
  }

  await prisma.school.delete({ where: { id } });

  await createAuditLog({
    ...extractActor(req),
    action: "SCHOOL_DELETED",
    targetType: "School",
    targetId: school.id,
    targetName: school.name,
    previousData: {
      name: school.name,
      status: school.status,
    },
    notes: req.body.reason as string | undefined,
  });

  res.json({ message: "School deleted" });
});

export const toggleFeatured = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const previous = await prisma.school.findUnique({
    where: { id },
    select: { id: true, name: true, isFeatured: true },
  });

  const school = await prisma.school.update({
    where: { id },
    data: { isFeatured: !previous?.isFeatured },
  });

  await createAuditLog({
    ...extractActor(req),
    action: "SCHOOL_FEATURED_TOGGLED",
    targetType: "School",
    targetId: school.id,
    targetName: school.name,
    previousData: { isFeatured: previous?.isFeatured },
    newData: { isFeatured: school.isFeatured },
  });

  res.json({ message: "Featured status updated", school });
});

// ── Moderation Queue ─────────────────────────────────────

export const listModerationQueue = asyncHandler(async (_req, res) => {
  const items = await prisma.pendingUpdate.findMany({
    where: { status: "pending" },
    include: { school: { select: { name: true } }, submitter: true },
    orderBy: { school: { createdAt: "desc" } },
  });
  res.json({ data: items });
});

async function applyProfilePendingSchoolUpdate(
  tx: Prisma.TransactionClient,
  schoolId: string,
  newValues: Record<string, unknown>,
) {
  const schoolPatch: Pick<Prisma.SchoolUpdateInput, "name" | "description" | "type" | "medium"> = {};
  if (newValues.name !== undefined && typeof newValues.name === "string") schoolPatch.name = newValues.name;
  if (newValues.description !== undefined && typeof newValues.description === "string") {
    schoolPatch.description = newValues.description;
  }
  if (newValues.type !== undefined && typeof newValues.type === "string") schoolPatch.type = newValues.type;
  if (newValues.medium !== undefined && typeof newValues.medium === "string") schoolPatch.medium = newValues.medium;

  if (Object.keys(schoolPatch).length > 0) {
    await tx.school.update({
      where: { id: schoolId },
      data: schoolPatch,
    });
  }

  if (
    newValues.principalName !== undefined ||
    newValues.phone !== undefined ||
    newValues.whatsapp !== undefined ||
    newValues.email !== undefined
  ) {
    await tx.schoolDetails.update({
      where: { schoolId },
      data: {
        ...(typeof newValues.principalName === "string" ? { principalName: newValues.principalName } : {}),
        ...(typeof newValues.phone === "string" ? { phone: newValues.phone } : {}),
        ...(typeof newValues.whatsapp === "string" ? { whatsapp: newValues.whatsapp } : {}),
        ...(typeof newValues.email === "string"
          ? { email: newValues.email === "" ? null : newValues.email }
          : {}),
      },
    });
  }

  if (newValues.addressLine !== undefined || newValues.pincode !== undefined) {
    await tx.schoolAddress.update({
      where: { schoolId },
      data: {
        ...(typeof newValues.addressLine === "string" ? { addressLine: newValues.addressLine } : {}),
        ...(typeof newValues.pincode === "string" ? { pincode: newValues.pincode } : {}),
      },
    });
  }

  const feePatch: Record<string, number | null | undefined> = {};
  for (const key of ["admissionFee", "tuitionFeeMonthly", "tuitionFeeAnnual", "transportFee", "hostelFee"] as const) {
    if (newValues[key] === undefined) continue;
    const val = newValues[key];
    if (val === null) feePatch[key] = null;
    else if (typeof val === "number") feePatch[key] = val;
    else feePatch[key] = Number(val);
  }
  if (Object.keys(feePatch).length > 0) {
    await tx.schoolFees.update({
      where: { schoolId },
      data: feePatch,
    });
  }

  if (Array.isArray(newValues.gallery)) {
    await tx.schoolGallery.deleteMany({ where: { schoolId } });
    let i = 0;
    for (const raw of newValues.gallery) {
      const item = raw as Record<string, unknown>;
      const url = typeof item.cloudinaryUrl === "string" ? item.cloudinaryUrl.trim() : "";
      if (!url) continue;
      const typeRaw = typeof item.type === "string" ? item.type.toLowerCase() : "photo";
      const galType = (typeRaw === "video" ? "video" : "photo") as GalleryType;
      const orderNum = typeof item.order === "number" ? item.order : i;
      await tx.schoolGallery.create({
        data: {
          schoolId,
          cloudinaryUrl: url,
          type: galType,
          order: orderNum,
          caption: typeof item.caption === "string" ? item.caption : undefined,
        },
      });
      i += 1;
    }
  }

  if (Array.isArray(newValues.sections)) {
    await tx.schoolSection.deleteMany({ where: { schoolId } });
    let j = 0;
    for (const raw of newValues.sections) {
      const sec = raw as Record<string, unknown>;
      await tx.schoolSection.create({
        data: {
          schoolId,
          title: String(sec.title ?? ""),
          content: String(sec.content ?? ""),
          sectionType: String(sec.sectionType ?? "custom"),
          order: typeof sec.order === "number" ? sec.order : j,
        },
      });
      j += 1;
    }
  }
}

async function logModerationDecision(
  pendingUpdateId: string,
  adminId: string,
  action: "approve" | "reject",
  note?: string,
) {
  try {
    await prisma.approvalLog.create({
      data: { pendingUpdateId, action, adminId, note },
    });
  } catch (err) {
    logger.error("[Admin] approval log failed", {
      pendingUpdateId,
      action,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export const approveModerationItem = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const adminId = req.user!.id;

  const item = await prisma.$transaction(async (tx) => {
    const pending = await tx.pendingUpdate.findUnique({ where: { id } });
    if (!pending) throw new HttpError(404, "Pending update not found");
    if (pending.status !== "pending") throw new HttpError(400, "Already reviewed");

    const newValues = pending.newValue as Record<string, unknown> | null;
    if (newValues && pending.fieldType === "profile") {
      await applyProfilePendingSchoolUpdate(tx, pending.schoolId, newValues);
    }

    return tx.pendingUpdate.update({
      where: { id },
      data: { status: "approved", reviewedBy: adminId, reviewedAt: new Date() },
    });
  });

  res.json({ message: "Pending update approved", id: item.id });

  void logModerationDecision(item.id, adminId, "approve");
});

export const rejectModerationItem = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const adminId = req.user!.id;
  const reason = req.body.reason as string | undefined;

  const item = await prisma.pendingUpdate.update({
    where: { id },
    data: { status: "rejected", reviewedBy: adminId, reviewedAt: new Date() },
  });

  res.json({ message: "Pending update rejected", id: item.id, reason });

  void logModerationDecision(item.id, adminId, "reject", reason);

  // Email school owner with rejection reason.
  void (async () => {
    try {
      const school = await prisma.school.findUnique({
        where: { id: item.schoolId },
        include: { details: true, owner: true },
      });
      const email = school?.details?.email ?? school?.owner?.email;
      if (!email || !school) return;
      await resendService.sendMail(
        email,
        `Update on your profile change request — ${school.name}`,
        `<p>Hi,</p><p>Your recent profile update for <strong>${school.name}</strong> was not approved.</p>${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}<p>Please review and resubmit from your <a href="${env.FRONTEND_URL}/school/dashboard">dashboard</a>.</p>`,
      );
    } catch (err) {
      logger.error("[Admin] moderation rejection email failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  })();
});

// ── Audit Logs ───────────────────────────────────────────

export const listAuditLogs = asyncHandler(async (req, res) => {
  const {
    page = "1",
    limit = "50",
    actorId,
    action,
    targetType,
    targetId,
    from,
    to,
    search,
  } = req.query as Record<string, string | undefined>;

  const where: Prisma.AuditLogWhereInput = {};

  if (actorId) where.actorId = actorId;
  if (action) where.action = action as Prisma.AuditLogWhereInput["action"];
  if (targetType) where.targetType = targetType;
  if (targetId) where.targetId = targetId;
  if (from ?? to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }
  if (search) {
    where.OR = [
      { actorEmail: { contains: search, mode: "insensitive" } },
      { targetName: { contains: search, mode: "insensitive" } },
    ];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(200, Math.max(1, Number(limit)));

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.auditLog.count({ where }),
  ]);

  res.json({
    logs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

export const auditLogStats = asyncHandler(async (_req, res) => {
  const last30days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalActions, actionsByType, actionsByActor, recentDanger] =
    await Promise.all([
      prisma.auditLog.count({ where: { createdAt: { gte: last30days } } }),

      prisma.auditLog.groupBy({
        by: ["action"],
        _count: { action: true },
        where: { createdAt: { gte: last30days } },
        orderBy: { _count: { action: "desc" } },
      }),

      prisma.auditLog.groupBy({
        by: ["actorEmail", "actorTeamRole"],
        _count: { actorId: true },
        where: { createdAt: { gte: last30days } },
        orderBy: { _count: { actorId: "desc" } },
      }),

      prisma.auditLog.findMany({
        where: {
          action: "SCHOOL_DELETED",
          createdAt: { gte: last30days },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  res.json({ totalActions, actionsByType, actionsByActor, recentDanger });
});
