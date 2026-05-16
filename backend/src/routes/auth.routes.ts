import { Router } from "express";
import { googleAuth, sendOtp, verifyOtp } from "../controllers/auth.controller.js";
import { otpRateLimit } from "../middleware/security.js";

export const authRouter = Router();

authRouter.post("/send-otp", otpRateLimit, sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/google", googleAuth);
