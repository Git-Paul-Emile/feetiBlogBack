import cors from "cors";
import express from "express";
import helmet from "helmet";
import type { RequestHandler } from "express";
import { env } from "./config/env.js";
import { ForbiddenError } from "./core/errors/ForbiddenError.js";
import { errorHandler } from "./core/middlewares/errorHandler.js";
import { notFound } from "./core/middlewares/notFound.js";
import { apiRateLimiter } from "./core/middlewares/rateLimiters.js";
import { requestLogger } from "./core/middlewares/requestLogger.js";
import { apiRoutes } from "./routes.js";

export const app = express();
export const allowedOrigins = new Set(env.CORS_ORIGINS);
app.set("trust proxy", env.TRUST_PROXY_HOPS);

const enforceTrustedOrigin: RequestHandler = (request, _response, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const origin = request.get("origin");
    if (!origin || !allowedOrigins.has(origin)) {
      next(new ForbiddenError());
      return;
    }
  }
  next();
};

const httpsRedirect: RequestHandler = (request, response, next) => {
  if (env.NODE_ENV !== "production" || env.RENDER_EXTERNAL_URL || request.secure) {
    next();
    return;
  }

  if (!env.PUBLIC_BASE_URL) {
    next(new Error("PUBLIC_BASE_URL is required to redirect production traffic to HTTPS."));
    return;
  }

  response.redirect(308, new URL(request.originalUrl, env.PUBLIC_BASE_URL).toString());
};

app.disable("x-powered-by");
app.use(helmet());
app.use(httpsRedirect);
app.use(
  cors({
    origin(origin, callback) {
      if (origin === undefined) {
        callback(null, false);
        return;
      }

      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new ForbiddenError());
    },
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    maxAge: 600,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use("/api/v1", enforceTrustedOrigin);
app.use(apiRateLimiter);
app.use(requestLogger);
app.use("/api/v1", apiRoutes);
app.use(notFound);
app.use(errorHandler);
