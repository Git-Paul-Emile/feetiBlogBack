import { AppError } from "./AppError.js";

export class ForbiddenError extends AppError {
  constructor(message = "Cette origine n'est pas autorisée.") {
    super(403, "ORIGIN_NOT_ALLOWED", message);
  }
}
