import { Router } from "express";
import { createOrder, razorpayWebhook, verifyPayment } from "../controllers/payments.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const paymentsRouter = Router();

paymentsRouter.post("/create-order", requireAuth, requireRole("school", "admin"), createOrder);
paymentsRouter.post("/verify-payment", requireAuth, requireRole("school", "admin"), verifyPayment);
paymentsRouter.post("/webhook", razorpayWebhook);
