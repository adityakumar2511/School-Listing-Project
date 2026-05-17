import { Router } from "express";
import { env } from "../config/env.js";
import { isTwilioConfigured } from "../services/twilioService.js";
import {
  getPublicBlogPostBySlug,
  listPublicBlogPosts,
} from "../controllers/blog.controller.js";
import { adminRouter } from "./admin.routes.js";
import { aiRouter } from "./ai.routes.js";
import { authRouter } from "./auth.routes.js";
import { inquiriesRouter } from "./inquiries.routes.js";
import { mediaRouter } from "./media.routes.js";
import { paymentsRouter } from "./payments.routes.js";
import { schoolsRouter } from "./schools.routes.js";
import { searchRouter } from "./search.routes.js";
import { taxonomyRouter } from "./taxonomy.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_request, response) => {
  const body: Record<string, unknown> = {
    status: "ok",
    service: "schoolsetu-api",
    env: env.NODE_ENV,
    twilio: { configured: isTwilioConfigured },
    payments: { enabled: false, reason: "Razorpay disabled in current build" },
  };
  if (env.NODE_ENV === "development") {
    body.admin_email = "adityak4724@gmail.com";
  }
  response.json(body);
});

/** JWT-backed auth: /api/auth/register/*, login, OTP, forgot/reset password, Google bridge */
apiRouter.use("/auth", authRouter);
apiRouter.get("/admin/blog", listPublicBlogPosts);
apiRouter.get("/admin/blog/:slug", getPublicBlogPostBySlug);
apiRouter.use("/schools", schoolsRouter);
apiRouter.use("/inquiries", inquiriesRouter);
apiRouter.use("/ai", aiRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/upload", mediaRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use(taxonomyRouter);
