import { Router } from "express";
import {
  createBlogPostAdmin,
  deleteBlogPostAdmin,
  updateBlogPostAdmin,
} from "../controllers/blog.controller.js";
import {
  adminCreateSchool,
  approveModerationItem,
  approveSchool,
  auditLogStats,
  deleteSchool,
  editSchool,
  listAdminSchools,
  listAdminUsers,
  listAuditLogs,
  listModerationQueue,
  rejectModerationItem,
  rejectSchool,
  toggleFeatured,
} from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("admin"));

// Users
adminRouter.get("/users", listAdminUsers);

// Schools
adminRouter.get("/schools", listAdminSchools);
adminRouter.post("/schools", adminCreateSchool);
adminRouter.put("/schools/:id/approve", approveSchool);
adminRouter.put("/schools/:id/reject", rejectSchool);
adminRouter.put("/schools/:id/edit", editSchool);
adminRouter.delete("/schools/:id", deleteSchool);
adminRouter.put("/schools/:id/toggle-featured", toggleFeatured);

// Moderation queue
adminRouter.get("/moderation", listModerationQueue);
adminRouter.put("/moderation/:id/approve", approveModerationItem);
adminRouter.put("/moderation/:id/reject", rejectModerationItem);

// Audit logs — admin-only
adminRouter.get("/audit-logs/stats", auditLogStats);
adminRouter.get("/audit-logs", listAuditLogs);

// Blog — public GET /api/admin/blog is registered in routes/index.ts (no auth)
adminRouter.post("/blog", createBlogPostAdmin);
adminRouter.put("/blog/:id", updateBlogPostAdmin);
adminRouter.delete("/blog/:id", deleteBlogPostAdmin);
