import { Router } from "express";
import { listBoards, listCities, listStates } from "../controllers/taxonomy.controller.js";

export const taxonomyRouter = Router();

taxonomyRouter.get("/cities", listCities);
taxonomyRouter.get("/states", listStates);
taxonomyRouter.get("/boards", listBoards);
