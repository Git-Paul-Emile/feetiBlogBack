import { AppError } from "./AppError.js";

export class ServiceUnavailableError extends AppError {
  constructor(message = "Cette fonctionnalité n'est pas encore configurée.") {
    super(503, "SERVICE_UNAVAILABLE", message);
  }
}
