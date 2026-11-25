import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((email) => email.toLowerCase());
const passwordSchema = z.string().min(12).max(128);

export const adminRegistrationSchema = z.strictObject({
  email: emailSchema,
  name: z.string().trim().min(2).max(80),
  password: passwordSchema,
  registrationSecret: z.string().min(32).max(256),
});

export const adminLoginSchema = z.strictObject({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const emailVerificationSchema = z.strictObject({ token: z.string().min(32).max(256) });

export type AdminRegistrationInput = z.infer<typeof adminRegistrationSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
