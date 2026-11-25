import type { RequestHandler } from "express";
import { asyncHandler } from "../../core/http/asyncHandler.js";
import { apiSuccessResponse } from "../../core/http/apiResponse.js";
import { prisma } from "../../lib/prisma.js";

export const healthController: RequestHandler = asyncHandler(async (_request, response) => {
  await prisma.$queryRaw`SELECT 1`;
  response
    .status(200)
    .json(
      apiSuccessResponse({ status: "ok", mode: "database" }, "L'API et la base de données sont disponibles."),
    );
});
