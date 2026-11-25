import type { ApiErrorDetail } from "../http/apiResponse.js";
import { AppError } from "./AppError.js";

export class ValidationError extends AppError {
  constructor(message: string, details: readonly ApiErrorDetail[]) {
    super(400, "INVALID_REQUEST", message, details);
  }
}
