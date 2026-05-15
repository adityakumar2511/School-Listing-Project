import { Router } from "express";
import {
  approveModerationItem,
  approveSchool,
  listAdminSchools,
  listModerationQueue,
  rejectModerationItem,
  rejectSchool
} from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("admin"));
adminRouter.get("/schools", listAdminSchools);
adminRouter.put("/schools/:id/approve", approveSchool);
adminRouter.put("/schools/:id/reject", rejectSchool);
adminRouter.get("/moderation", listModerationQueue);
adminRouter.put("/moderation/:id/approve", approveModerationItem);
adminRouter.put("/moderation/:id/reject", rejectModerationItem);
