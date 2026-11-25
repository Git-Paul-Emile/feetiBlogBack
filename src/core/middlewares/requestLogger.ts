import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { logger } from "../../lib/logger.js";

export const requestLogger: RequestHandler = (request, response, next) => {
  const requestId = randomUUID();
  const startedAt = process.hrtime.bigint();
  response.setHeader("X-Request-Id", requestId);
  response.locals.requestId = requestId;

  response.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    logger.info("http_request", {
      requestId,
      method: request.method,
      path: request.path,
      statusCode: response.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    });
  });

  next();
};
