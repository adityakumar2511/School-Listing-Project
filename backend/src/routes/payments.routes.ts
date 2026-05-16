import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { createOrder, razorpayWebhook, verifyPayment } from "../controllers/payments.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const paymentsRouter = Router();

// TODO: re-enable when Razorpay is configured
function paymentsDisabled(_req: Request, res: Response, _next: NextFunction) {
  res.status(503).json({ message: "Payments are currently disabled.", disabled: true });
}

paymentsRouter.post("/create-order", paymentsDisabled, requireAuth, requireRole("school", "admin"), createOrder);
paymentsRouter.post("/verify-payment", paymentsDisabled, requireAuth, requireRole("school", "admin"), verifyPayment);
paymentsRouter.post("/webhook", paymentsDisabled, razorpayWebhook);
