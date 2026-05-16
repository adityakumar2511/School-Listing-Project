import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/http-error.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      error: error.message,
      ...error.details
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      error: "Validation error",
      details: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }))
    });
    return;
  }

  // Prisma cannot reach database server
  if (
    error instanceof Error &&
    (error.constructor.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server"))
  ) {
    console.error("[DB] Connection failed:", error.message);
    response.status(503).json({
      error: "Database unavailable. Please try again shortly."
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    error: "Internal server error"
  });
};
