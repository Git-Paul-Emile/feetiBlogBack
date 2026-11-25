import { z } from "zod";
import { createCollectionQuerySchema, slugParamsSchema } from "../../core/validation/common.schemas.js";

export const tutorialSchema = z.strictObject({
  duration: z.string(),
  level: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.string(),
});

export const articleSectionSchema = z.strictObject({
  title: z.string(),
  paragraphs: z.array(z.string()),
});

export const articleSchema = z.strictObject({
  slug: z.string(),
  category: z.string(),
  read: z.string(),
  title: z.string(),
  excerpt: z.string(),
  lead: z.string(),
  image: z.string(),
  sections: z.array(articleSectionSchema),
});

export const infoPageSchema = z.strictObject({
  eyebrow: z.string(),
  title: z.string(),
  intro: z.string(),
  sections: z.array(z.string()),
});

export const tutorialsQuerySchema = createCollectionQuerySchema(
  ["title", "-title", "level", "-level", "duration", "-duration"] as const,
  { level: z.string().max(80).optional() },
);

export const articlesQuerySchema = createCollectionQuerySchema(
  ["title", "-title", "slug", "-slug", "category", "-category", "read", "-read"] as const,
  { category: z.string().max(80).optional() },
);

export const contentSlugParamsSchema = slugParamsSchema;

export type TutorialsQuery = z.infer<typeof tutorialsQuerySchema>;
export type ArticlesQuery = z.infer<typeof articlesQuerySchema>;
