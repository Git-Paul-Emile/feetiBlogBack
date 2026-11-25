import { Router } from "express";
import { validateInput } from "../../core/middlewares/validate.js";
import { requireBlogAdmin } from "../../core/middlewares/requireBlogAdmin.js";
import { authRateLimiter } from "../../core/middlewares/rateLimiters.js";
import { validateBody } from "../../core/middlewares/validateBody.js";
import { validateArticleImageUpload } from "../../core/middlewares/validateImageUpload.js";
import { contentController } from "./content.controller.js";
import {
  articleWriteSchema,
  articlesQuerySchema,
  categoriesQuerySchema,
  contentSlugParamsSchema,
  tutorialsQuerySchema,
} from "./content.schemas.js";

export const contentRoutes = Router();

contentRoutes.get("/articles", validateInput("query", articlesQuerySchema), contentController.listArticles);
contentRoutes.get(
  "/categories",
  validateInput("query", categoriesQuerySchema),
  contentController.listCategories,
);
contentRoutes.post(
  "/images",
  requireBlogAdmin,
  authRateLimiter,
  validateArticleImageUpload,
  contentController.uploadArticleImage,
);
contentRoutes.post(
  "/articles",
  requireBlogAdmin,
  validateBody(articleWriteSchema),
  contentController.createArticle,
);
contentRoutes.put(
  "/articles/:slug",
  requireBlogAdmin,
  validateInput("params", contentSlugParamsSchema),
  validateBody(articleWriteSchema),
  contentController.updateArticle,
);
contentRoutes.delete(
  "/articles/:slug",
  requireBlogAdmin,
  validateInput("params", contentSlugParamsSchema),
  contentController.deleteArticle,
);
contentRoutes.get(
  "/articles/:slug",
  validateInput("params", contentSlugParamsSchema),
  contentController.getArticleBySlug,
);
contentRoutes.get(
  "/tutorials",
  validateInput("query", tutorialsQuerySchema),
  contentController.listTutorials,
);
contentRoutes.get(
  "/pages/:slug",
  validateInput("params", contentSlugParamsSchema),
  contentController.getInfoPageBySlug,
);
