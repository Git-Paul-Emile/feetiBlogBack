import { Router } from "express";
import { validateInput } from "../../core/middlewares/validate.js";
import { contentController } from "./content.controller.js";
import { articlesQuerySchema, contentSlugParamsSchema, tutorialsQuerySchema } from "./content.schemas.js";

export const contentRoutes = Router();

contentRoutes.get("/articles", validateInput("query", articlesQuerySchema), contentController.listArticles);
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
