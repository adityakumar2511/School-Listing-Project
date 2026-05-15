import { Router } from "express";
import { createSchool, getSchool, getSchoolInquiries, listSchools, updateSchool } from "../controllers/schools.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const schoolsRouter = Router();

schoolsRouter.get("/", listSchools);
schoolsRouter.get("/:slug", getSchool);
schoolsRouter.post("/", createSchool);
schoolsRouter.put("/:id", requireAuth, requireRole("school", "admin"), updateSchool);
schoolsRouter.get("/:id/inquiries", requireAuth, requireRole("school", "admin"), getSchoolInquiries);
