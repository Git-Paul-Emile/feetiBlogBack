import { asyncHandler } from "../../core/http/asyncHandler.js";
import { apiSuccessResponse } from "../../core/http/apiResponse.js";
import { getValidatedInput } from "../../core/middlewares/validate.js";
import { getArticleBySlug, getInfoPageBySlug, listArticles, listTutorials } from "./content.service.js";
import type { ArticlesQuery, TutorialsQuery } from "./content.schemas.js";
import type { ArticleDto, InfoPageDto } from "./content.dto.js";

export const contentController = {
  listArticles: asyncHandler(async (_request, response) => {
    const query = getValidatedInput<ArticlesQuery>(response, "query");
    const result = await listArticles(query);
    response.status(200).json(apiSuccessResponse(result, "Les articles ont été récupérés."));
  }),

  getArticleBySlug: asyncHandler(async (_request, response) => {
    const { slug } = getValidatedInput<{ slug: string }>(response, "params");
    const article: ArticleDto = await getArticleBySlug(slug);
    response.status(200).json(apiSuccessResponse(article, "L'article a été récupéré."));
  }),

  listTutorials: asyncHandler(async (_request, response) => {
    const query = getValidatedInput<TutorialsQuery>(response, "query");
    const result = await listTutorials(query);
    response.status(200).json(apiSuccessResponse(result, "Les tutoriels ont été récupérés."));
  }),

  getInfoPageBySlug: asyncHandler(async (_request, response) => {
    const { slug } = getValidatedInput<{ slug: string }>(response, "params");
    const page: InfoPageDto = await getInfoPageBySlug(slug);
    response.status(200).json(apiSuccessResponse(page, "La page d'information a été récupérée."));
  }),
};
