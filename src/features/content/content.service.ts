import { NotFoundError } from "../../core/errors/NotFoundError.js";
import { queryCollection } from "../../core/http/pagination.js";
import { mockContentRepository } from "./content.repository.js";
import type { ArticlesQuery, TutorialsQuery } from "./content.schemas.js";
import type { ArticleDto, InfoPageDto } from "./content.dto.js";

export function listArticles(query: ArticlesQuery) {
  return queryCollection(mockContentRepository.findArticles(), {
    query,
    filter: (article) => query.category === undefined || article.category === query.category,
    searchFields: [
      (article) => article.category,
      (article) => article.title,
      (article) => article.excerpt,
      (article) => article.lead,
    ],
    sortFields: {
      title: (article) => article.title,
      slug: (article) => article.slug,
      category: (article) => article.category,
      read: (article) => article.read,
    },
  });
}

export function getArticleBySlug(slug: string): ArticleDto {
  const article = mockContentRepository.findArticleBySlug(slug);
  if (!article) throw new NotFoundError("Cet article est introuvable.");
  return article;
}

export function listTutorials(query: TutorialsQuery) {
  return queryCollection(mockContentRepository.findTutorials(), {
    query,
    filter: (tutorial) => query.level === undefined || tutorial.level === query.level,
    searchFields: [
      (tutorial) => tutorial.level,
      (tutorial) => tutorial.title,
      (tutorial) => tutorial.description,
    ],
    sortFields: {
      title: (tutorial) => tutorial.title,
      level: (tutorial) => tutorial.level,
      duration: (tutorial) => tutorial.duration,
    },
  });
}

export function getInfoPageBySlug(slug: string): InfoPageDto {
  const page = mockContentRepository.findInfoPageBySlug(slug);
  if (!page) throw new NotFoundError("Cette page d'information est introuvable.");
  return page;
}
