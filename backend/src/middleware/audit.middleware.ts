import type { NextFunction, Request, Response } from "express";
import { AuditAction } from "@prisma/client";
import { createAuditLog, extractActor } from "../services/audit.service.js";

type TargetInfoFn = (
  req: Request,
  responseData: unknown
) => {
  targetId: string;
  targetName?: string;
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  notes?: string;
};

/**
 * Auto-log middleware — attach to a route to record the action on success.
 * Wraps res.json so it fires after the controller responds.
 */
export function auditLog(
  action: AuditAction,
  targetType: string,
  getTargetInfo: TargetInfoFn
) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res) as (body: unknown) => Response;

    // res.json must stay synchronous — fire audit write as a detached promise
    res.json = function (data: unknown) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        Promise.resolve()
          .then(() => {
            const targetInfo = getTargetInfo(_req, data);
            return createAuditLog({
              ...extractActor(_req),
              action,
              targetType,
              ...targetInfo,
            });
          })
          .catch((e) => console.error("Audit middleware error:", e));
      }
      return originalJson(data);
    };

    next();
  };
}
