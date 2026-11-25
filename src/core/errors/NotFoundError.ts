import { AppError } from "./AppError.js";

export class NotFoundError extends AppError {
  constructor(message = "La ressource demandée est introuvable.") {
    super(404, "RESOURCE_NOT_FOUND", message);
  }
}
