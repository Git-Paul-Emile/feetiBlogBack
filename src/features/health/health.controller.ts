import type { RequestHandler } from "express";
import { asyncHandler } from "../../core/http/asyncHandler.js";
import { apiSuccessResponse } from "../../core/http/apiResponse.js";

export const healthController: RequestHandler = asyncHandler((_request, response) => {
  response
    .status(200)
    .json(
      apiSuccessResponse({ status: "ok", mode: "mock" }, "L'API est disponible avec ses données mockées."),
    );
});
