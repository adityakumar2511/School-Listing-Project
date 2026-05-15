import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

export type AuthRole = "parent" | "school" | "admin";

export type AuthUser = {
  id: string;
  role: AuthRole;
  phone?: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(request: Request, _response: Response, next: NextFunction) {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    throw new HttpError(401, "Authentication required");
  }

  request.user = jwt.verify(token, env.JWT_SECRET) as AuthUser;
  next();
}

export function requireRole(...roles: AuthRole[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user || !roles.includes(request.user.role)) {
      throw new HttpError(403, "Insufficient permissions");
    }

    next();
  };
}
