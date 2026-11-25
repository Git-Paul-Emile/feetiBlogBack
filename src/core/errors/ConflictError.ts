import { AppError } from "./AppError.js";

export class ConflictError extends AppError {
  constructor(message = "Cette ressource existe déjà.") {
    super(409, "RESOURCE_CONFLICT", message);
  }
}
