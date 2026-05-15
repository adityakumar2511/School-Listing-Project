import { Router } from "express";
import { listSchools } from "../controllers/schools.controller.js";

export const searchRouter = Router();

searchRouter.get("/", listSchools);
