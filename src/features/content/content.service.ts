import { NotFoundError } from "../../core/errors/NotFoundError.js";
import { queryCollection } from "../../core/http/pagination.js";
import { databaseContentRepository } from "./content.repository.js";
import type { ArticlesQuery, TutorialsQuery } from "./content.schemas.js";
import type { ArticleDto, InfoPageDto } from "./content.dto.js";

export async function listArticles(query: ArticlesQuery) {
  return queryCollection(await databaseContentRepository.findArticles(), {
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

export async function getArticleBySlug(slug: string): Promise<ArticleDto> {
  const article = await databaseContentRepository.findArticleBySlug(slug);
  if (!article) throw new NotFoundError("Cet article est introuvable.");
  return article;
}

export async function listTutorials(query: TutorialsQuery) {
  return queryCollection(await databaseContentRepository.findTutorials(), {
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

export async function getInfoPageBySlug(slug: string): Promise<InfoPageDto> {
  const page = await databaseContentRepository.findInfoPageBySlug(slug);
  if (!page) throw new NotFoundError("Cette page d'information est introuvable.");
  return page;
}
