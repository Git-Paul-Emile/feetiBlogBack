import { rateLimit } from "express-rate-limit";
import type { RequestHandler } from "express";
import { apiErrorResponse } from "../http/apiResponse.js";

export const apiRateLimiter: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_request, response) {
    response
      .status(429)
      .json(apiErrorResponse(429, "RATE_LIMIT_EXCEEDED", "Trop de requêtes. Réessayez plus tard."));
  },
});

export const authRateLimiter: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_request, response) {
    response
      .status(429)
      .json(apiErrorResponse(429, "AUTH_RATE_LIMIT_EXCEEDED", "Trop de tentatives. Réessayez plus tard."));
  },
});
