import { Router } from "express";
import { createSchool, getMySchool, getSchool, getSchoolInquiries, listSchools, updateSchool } from "../controllers/schools.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const schoolsRouter = Router();

schoolsRouter.get("/", listSchools);
// /me must come before /:slug so it is not treated as a slug
schoolsRouter.get("/me", requireAuth, getMySchool);
schoolsRouter.get("/:slug", getSchool);
schoolsRouter.post("/", requireAuth, createSchool);
schoolsRouter.put("/:id", requireAuth, requireRole("school", "admin"), updateSchool);
schoolsRouter.get("/:id/inquiries", requireAuth, requireRole("school", "admin"), getSchoolInquiries);
