import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    PUBLIC_BASE_URL: z.preprocess((value) => {
      if (typeof value === "string" && value.trim() !== "") return value;
      const renderExternalUrl = process.env.RENDER_EXTERNAL_URL?.trim();
      return renderExternalUrl || undefined;
    }, z.string().url().optional()),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(10).default(0),
    ADMIN_REGISTRATION_SECRET: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().min(32).optional(),
    ),
    RESEND_API_KEY: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().min(1).optional(),
    ),
    EMAIL_FROM: z.string().min(3).default("Feeti Blog <noreply@example.com>"),
    FRONTEND_BASE_URL: z.string().url().default("https://feetiblogfront.vercel.app"),
    DATABASE_URL: z.string().min(1),
    DIRECT_URL: z.string().min(1),
    CLOUDINARY_URL: z.string().min(1),
    CORS_ORIGINS: z
      .preprocess(
        (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
        z
          .string()
          .default(
            process.env.NODE_ENV === "production"
              ? "https://feetiblogfront.vercel.app"
              : "http://localhost:5173",
          ),
      )
      .transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
  })
  .superRefine((configuration, context) => {
    if (configuration.NODE_ENV !== "production") return;

    if (!configuration.PUBLIC_BASE_URL) {
      context.addIssue({
        code: "custom",
        path: ["PUBLIC_BASE_URL"],
        message: "PUBLIC_BASE_URL est obligatoire en production.",
      });
      return;
    }

    if (!configuration.PUBLIC_BASE_URL.toLowerCase().startsWith("https://")) {
      context.addIssue({
        code: "custom",
        path: ["PUBLIC_BASE_URL"],
        message: "PUBLIC_BASE_URL doit utiliser HTTPS en production.",
      });
    }
  });

export const env = envSchema.parse(process.env);
