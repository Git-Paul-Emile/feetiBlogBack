import type { RequestHandler, Response } from "express";
import { z } from "zod";
import { ValidationError } from "../errors/ValidationError.js";

type ValidatedInputSource = "query" | "params";

export function validateInput<TSchema extends z.ZodType>(
  source: ValidatedInputSource,
  schema: TSchema,
): RequestHandler {
  return (request, response, next) => {
    const input: unknown = source === "query" ? request.query : request.params;
    const result = schema.safeParse(input);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.map(String).join("."),
        message: issue.message,
      }));
      next(new ValidationError("Les paramètres de la requête sont invalides.", details));
      return;
    }

    response.locals[source === "query" ? "validatedQuery" : "validatedParams"] = result.data;
    next();
  };
}

export function getValidatedInput<Input extends object>(
  response: Response,
  source: ValidatedInputSource,
): Input {
  const key = source === "query" ? "validatedQuery" : "validatedParams";
  return response.locals[key] as Input;
}
