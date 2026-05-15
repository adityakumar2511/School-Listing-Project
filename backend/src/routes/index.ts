import { Router } from "express";
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
  response.json({ status: "ok", service: "schoolsetu-api" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/schools", schoolsRouter);
apiRouter.use("/inquiries", inquiriesRouter);
apiRouter.use("/ai", aiRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/upload", mediaRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use(taxonomyRouter);
