import { z } from "zod";

export const apiErrorDetailSchema = z.strictObject({
  path: z.string(),
  message: z.string(),
});

export const apiErrorResponseSchema = z.strictObject({
  success: z.literal(false),
  status: z.number().int(),
  message: z.string(),
  error: z.strictObject({
    code: z.string(),
    details: z.array(apiErrorDetailSchema).optional(),
  }),
});

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiSuccessResponse<Data> {
  success: true;
  status: number;
  message: string;
  data: Data;
}

export interface ApiErrorResponse {
  success: false;
  status: number;
  message: string;
  error: {
    code: string;
    details?: readonly ApiErrorDetail[];
  };
}

export function apiSuccessResponse<Data>(
  data: Data,
  message: string,
  status = 200,
): ApiSuccessResponse<Data> {
  return { success: true, status, message, data };
}

export function apiErrorResponse(
  status: number,
  code: string,
  message: string,
  details?: readonly ApiErrorDetail[],
): ApiErrorResponse {
  const error = details === undefined ? { code } : { code, details };

  return { success: false, status, message, error };
}

export function apiSuccessResponseSchema<DataSchema extends z.ZodType>(dataSchema: DataSchema) {
  return z.strictObject({
    success: z.literal(true),
    status: z.number().int(),
    message: z.string(),
    data: dataSchema,
  });
}
