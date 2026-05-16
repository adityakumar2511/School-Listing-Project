import { AuditAction } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export interface AuditParams {
  actorId: string;
  actorEmail?: string;
  actorRole: string;
  actorTeamRole?: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  targetName?: string;
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
}

export async function createAuditLog(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        actorEmail: params.actorEmail,
        actorRole: params.actorRole,
        actorTeamRole: params.actorTeamRole,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        targetName: params.targetName,
        // Record<string, unknown> → Prisma Json requires explicit cast
        previousData: params.previousData as
          | Parameters<typeof prisma.auditLog.create>[0]["data"]["previousData"]
          | undefined,
        newData: params.newData as
          | Parameters<typeof prisma.auditLog.create>[0]["data"]["newData"]
          | undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        notes: params.notes,
      },
    });
  } catch (error) {
    // Audit log failure must never block the main operation
    console.error("Audit log failed:", error);
  }
}

export function extractActor(req: {
  user?: { id: string; role: string; phone?: string };
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
}) {
  const user = req.user!;
  const forwarded = req.headers["x-forwarded-for"];
  const ipAddress =
    req.ip ??
    (Array.isArray(forwarded) ? forwarded[0] : forwarded) ??
    undefined;
  const userAgent =
    typeof req.headers["user-agent"] === "string"
      ? req.headers["user-agent"]
      : undefined;

  return {
    actorId: user.id,
    actorEmail: user.phone ?? undefined,
    actorRole: user.role,
    ipAddress,
    userAgent,
  };
}
