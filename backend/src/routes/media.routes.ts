import { Router } from "express";
import { deleteImage, uploadImage } from "../controllers/media.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const mediaRouter = Router();

mediaRouter.post("/image", requireAuth, requireRole("school", "admin"), uploadImage);
mediaRouter.delete("/image/:id", requireAuth, requireRole("school", "admin"), deleteImage);
