import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError.js";
import { apiErrorResponse } from "../http/apiResponse.js";
import { logger } from "../../lib/logger.js";

export const errorHandler: ErrorRequestHandler = (error: unknown, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  const appError =
    error instanceof AppError
      ? error
      : new AppError(500, "INTERNAL_SERVER_ERROR", "Une erreur interne est survenue.");

  if (!(error instanceof AppError)) {
    logger.error("unhandled_error", {
      requestId: String(response.locals.requestId ?? "unknown"),
      method: request.method,
      path: request.path,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
  }

  response
    .status(appError.statusCode)
    .json(apiErrorResponse(appError.statusCode, appError.code, appError.message, appError.details));
};
