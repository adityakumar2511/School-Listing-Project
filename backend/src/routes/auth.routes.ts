import { Router } from "express";
import {
  forgotPassword,
  googleAuth,
  login,
  registerParent,
  registerSchool,
  resetPassword,
  sendPhoneOtpForLogin,
  verifyEmailOtp,
  verifyPhoneOtpForLogin,
} from "../controllers/auth.controller.js";
import { otpRateLimit } from "../middleware/security.js";

export const authRouter = Router();

authRouter.post("/register/parent", otpRateLimit, registerParent);
authRouter.post("/register/school", otpRateLimit, registerSchool);
authRouter.post("/verify-email-otp", verifyEmailOtp);
authRouter.post("/login", login);
authRouter.post("/send-otp", otpRateLimit, sendPhoneOtpForLogin);
authRouter.post("/verify-otp", verifyPhoneOtpForLogin);
authRouter.post("/forgot-password", otpRateLimit, forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/google", googleAuth);
