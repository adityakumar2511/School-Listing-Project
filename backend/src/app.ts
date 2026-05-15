import express from "express";
import morgan from "morgan";
import { apiRouter } from "./routes/index.js";
import { corsMiddleware, apiRateLimit, helmetMiddleware } from "./middleware/security.js";
import { errorHandler } from "./middleware/error-handler.js";

export function createApp() {
  const app = express();

  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(apiRateLimit);
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("dev"));

  app.use("/api", apiRouter);
  app.use(errorHandler);

  return app;
}
