import winston from "winston";
import { env } from "./env.js";

const level = env.NODE_ENV === "production" ? "info" : "debug";

export const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    env.NODE_ENV === "production"
      ? winston.format.json()
      : winston.format.printf(({ timestamp, level: lvl, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
          return `${String(timestamp)} ${lvl}: ${String(message)}${metaStr}`;
        }),
  ),
  transports: [new winston.transports.Console()],
});
