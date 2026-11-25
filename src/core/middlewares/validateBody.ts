import type { RequestHandler } from "express";
import { z } from "zod";
import { ValidationError } from "../errors/ValidationError.js";

export function validateBody<TSchema extends z.ZodType>(schema: TSchema): RequestHandler {
  return (request, response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.map(String).join("."),
        message: issue.message,
      }));
      next(new ValidationError("Les données envoyées sont invalides.", details));
      return;
    }

    response.locals.validatedBody = result.data;
    next();
  };
}

export function getValidatedBody<Input extends object>(response: import("express").Response): Input {
  return response.locals.validatedBody as Input;
}
