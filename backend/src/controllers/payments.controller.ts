import crypto from "node:crypto";
import { razorpayService } from "../services/razorpay.service.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";

export const createOrder = asyncHandler(async (request, response) => {
  const amount = Number(request.body.amount ?? 0);
  const result = await razorpayService.createOrder(amount, `featured_${Date.now()}`);
  response.status(201).json({ data: result });
});

export const verifyPayment = asyncHandler(async (request, response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = request.body;
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET ?? "")
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (env.RAZORPAY_KEY_SECRET && expected !== razorpay_signature) {
    throw new HttpError(400, "Invalid Razorpay signature");
  }

  response.json({ message: "Payment verified" });
});

export const razorpayWebhook = asyncHandler(async (_request, response) => {
  response.json({ received: true });
});
