import type { ApiErrorDetail } from "../http/apiResponse.js";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: readonly ApiErrorDetail[],
  ) {
    super(message);
    this.name = new.target.name;
  }
}
