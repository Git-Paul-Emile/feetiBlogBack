import { z } from "zod";
import { createCollectionQuerySchema, slugParamsSchema } from "../../core/validation/common.schemas.js";

const productTextSchema = z.string();

const productDetailSchema = z.strictObject({
  title: productTextSchema,
  description: productTextSchema,
});

export const productSchema = z.strictObject({
  slug: productTextSchema,
  index: productTextSchema,
  name: productTextSchema,
  eyebrow: productTextSchema,
  title: productTextSchema,
  description: productTextSchema,
  accent: productTextSchema,
  soft: productTextSchema,
  image: productTextSchema,
  imageAlt: productTextSchema,
  stat: productTextSchema,
  outcome: productTextSchema,
  features: z.array(productDetailSchema),
  steps: z.array(productDetailSchema),
  quote: productTextSchema,
  quoteAttribution: productTextSchema,
  cta: productTextSchema,
  contact: productTextSchema,
});

export const productsQuerySchema = createCollectionQuerySchema(
  ["slug", "-slug", "index", "-index", "name", "-name", "title", "-title"] as const,
  {
    slug: z
      .string()
      .regex(/^[a-z0-9-]{1,100}$/)
      .optional(),
  },
);

export const productParamsSchema = slugParamsSchema;

export type ProductsQuery = z.infer<typeof productsQuerySchema>;
