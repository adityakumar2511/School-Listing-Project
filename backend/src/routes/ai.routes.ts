import { Router } from "express";
import { recommendSchools } from "../controllers/ai.controller.js";

export const aiRouter = Router();

aiRouter.post("/recommend", recommendSchools);
