import { AppError } from "./AppError.js";

export class UnauthorizedError extends AppError {
  constructor(message = "Authentification requise.") {
    super(401, "UNAUTHORIZED", message);
  }
}
