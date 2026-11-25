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
  imagePublicId: z.string(),
  sections: z.array(articleSectionSchema),
});

const articleWriteSectionSchema = z.strictObject({
  title: z.string().trim().min(3).max(160),
  paragraphs: z.array(z.string().trim().min(1).max(4000)).min(1).max(8),
});

const secureImageUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (value === "") return true;
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "L'image doit utiliser une URL HTTPS.");

export const articleWriteSchema = z
  .strictObject({
    title: z.string().trim().min(5).max(180),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    categorySlug: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    excerpt: z.string().trim().min(10).max(320),
    lead: z.string().trim().min(20).max(1200),
    imageUrl: secureImageUrlSchema.default(""),
    imagePublicId: z.string().trim().max(255).optional(),
    sections: z.array(articleWriteSectionSchema).min(1).max(20),
  })
  .superRefine((article, context) => {
    if (article.imageUrl && !article.imageUrl.startsWith("https://res.cloudinary.com/")) {
      context.addIssue({
        code: "custom",
        path: ["imageUrl"],
        message: "Les images d'article doivent être hébergées dans Cloudinary.",
      });
    }
    if (article.imageUrl && !article.imagePublicId) {
      context.addIssue({
        code: "custom",
        path: ["imagePublicId"],
        message: "Importez l'image dans Cloudinary avant d'enregistrer l'article.",
      });
    }
  });

export const categorySchema = z.strictObject({ slug: z.string(), name: z.string() });

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

export const categoriesQuerySchema = createCollectionQuerySchema(
  ["name", "-name", "slug", "-slug"] as const,
  {},
);

export const contentSlugParamsSchema = slugParamsSchema;

export type TutorialsQuery = z.infer<typeof tutorialsQuerySchema>;
export type ArticlesQuery = z.infer<typeof articlesQuerySchema>;
export type ArticleInput = z.infer<typeof articleWriteSchema>;
export type CategoriesQuery = z.infer<typeof categoriesQuerySchema>;
