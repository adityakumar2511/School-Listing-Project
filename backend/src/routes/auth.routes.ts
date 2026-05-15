import { Router } from "express";
import { sendOtp, verifyOtp } from "../controllers/auth.controller.js";
import { otpRateLimit } from "../middleware/security.js";

export const authRouter = Router();

authRouter.post("/send-otp", otpRateLimit, sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/google", (_request, response) => {
  response.json({ message: "Google OAuth callback is handled by Auth.js on the frontend." });
});
