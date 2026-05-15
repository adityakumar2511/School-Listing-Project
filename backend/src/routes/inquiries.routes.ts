import { Router } from "express";
import { addInquiryNote, createInquiry, listInquiries, updateInquiryStatus } from "../controllers/inquiries.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const inquiriesRouter = Router();

inquiriesRouter.get("/", requireAuth, requireRole("parent"), listInquiries);
inquiriesRouter.post("/", requireAuth, requireRole("parent"), createInquiry);
inquiriesRouter.put("/:id/status", requireAuth, requireRole("school", "admin"), updateInquiryStatus);
inquiriesRouter.post("/:id/notes", requireAuth, requireRole("school", "admin"), addInquiryNote);
