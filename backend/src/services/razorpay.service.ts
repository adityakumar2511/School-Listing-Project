import Razorpay from "razorpay";
import { env } from "../config/env.js";

export class RazorpayService {
  private client =
    env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET
      ? new Razorpay({
          key_id: env.RAZORPAY_KEY_ID,
          key_secret: env.RAZORPAY_KEY_SECRET
        })
      : null;

  async createOrder(amount: number, receipt: string) {
    if (!this.client) {
      return { skipped: true, reason: "Razorpay credentials not configured", amount, receipt };
    }

    return this.client.orders.create({
      amount,
      currency: "INR",
      receipt
    });
  }
}

export const razorpayService = new RazorpayService();
