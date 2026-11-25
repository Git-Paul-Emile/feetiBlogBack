import { asyncHandler } from "../../core/http/asyncHandler.js";
import { apiSuccessResponse } from "../../core/http/apiResponse.js";
import { getValidatedInput } from "../../core/middlewares/validate.js";
import { getValidatedBody } from "../../core/middlewares/validateBody.js";
import { ValidationError } from "../../core/errors/ValidationError.js";
import { createArticle, deleteArticle, listCategories, updateArticle } from "./content.admin.service.js";
import { storeArticleImage } from "./content.media.service.js";
import { getArticleBySlug, getInfoPageBySlug, listArticles, listTutorials } from "./content.service.js";
import type { ArticleInput, ArticlesQuery, CategoriesQuery, TutorialsQuery } from "./content.schemas.js";
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

  listCategories: asyncHandler(async (_request, response) => {
    const query = getValidatedInput<CategoriesQuery>(response, "query");
    const result = await listCategories(query);
    response.status(200).json(apiSuccessResponse(result, "Les catégories ont été récupérées."));
  }),

  createArticle: asyncHandler(async (_request, response) => {
    const input = getValidatedBody<ArticleInput>(response);
    const article = await createArticle(input);
    response.location(`/api/v1/content/articles/${article.slug}`);
    response.status(201).json(apiSuccessResponse(article, "L'article a été créé.", 201));
  }),

  updateArticle: asyncHandler(async (_request, response) => {
    const { slug } = getValidatedInput<{ slug: string }>(response, "params");
    const input = getValidatedBody<ArticleInput>(response);
    const article = await updateArticle(slug, input);
    response.status(200).json(apiSuccessResponse(article, "L'article a été modifié."));
  }),

  deleteArticle: asyncHandler(async (_request, response) => {
    const { slug } = getValidatedInput<{ slug: string }>(response, "params");
    await deleteArticle(slug);
    response.status(204).end();
  }),

  uploadArticleImage: asyncHandler(async (request, response) => {
    const image = request.file;
    if (!image) throw new ValidationError("Sélectionnez une image à importer.", []);
    const uploadedImage = await storeArticleImage(image.buffer, image.mimetype);
    response
      .status(201)
      .json(apiSuccessResponse(uploadedImage, "L'image a été importée dans Cloudinary.", 201));
  }),
};
