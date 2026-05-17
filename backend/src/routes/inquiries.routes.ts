import { Router } from "express";
import {
  addInquiryNote,
  createInquiry,
  listInquiries,
  listInquiriesForSchoolBoard,
  listPlatformInquiries,
  updateInquiryStatus,
} from "../controllers/inquiries.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const inquiriesRouter = Router();

inquiriesRouter.get("/", requireAuth, requireRole("admin"), listPlatformInquiries);
// Parent submits and lists their own inquiries.
inquiriesRouter.post("/", requireAuth, requireRole("parent"), createInquiry);
inquiriesRouter.get("/for-school", requireAuth, requireRole("school", "admin"), listInquiriesForSchoolBoard);
inquiriesRouter.get("/my", requireAuth, requireRole("parent"), listInquiries);

// Status update + notes — school owner of the inquiry's school, or admin.
inquiriesRouter.put("/:id/status", requireAuth, requireRole("school", "admin"), updateInquiryStatus);
inquiriesRouter.post("/:id/notes", requireAuth, requireRole("school", "admin"), addInquiryNote);
