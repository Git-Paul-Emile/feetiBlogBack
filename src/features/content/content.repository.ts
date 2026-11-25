import { z } from "zod";
import { articles, infoPages, tutorials } from "./content.data.js";
import type { ArticleDto, InfoPageDto, TutorialDto } from "./content.dto.js";
import { articleSchema, infoPageSchema, tutorialSchema } from "./content.schemas.js";

export interface ContentRepository {
  findArticles(): readonly ArticleDto[];
  findArticleBySlug(slug: string): ArticleDto | undefined;
  findTutorials(): readonly TutorialDto[];
  findInfoPageBySlug(slug: string): InfoPageDto | undefined;
}

const mockArticles = z.array(articleSchema).parse(articles);
const mockTutorials = z.array(tutorialSchema).parse(tutorials);
const mockInfoPages = z.record(z.string(), infoPageSchema).parse(infoPages);

export const mockContentRepository: ContentRepository = {
  findArticles: () => mockArticles,
  findArticleBySlug: (slug) => mockArticles.find((article) => article.slug === slug),
  findTutorials: () => mockTutorials,
  findInfoPageBySlug: (slug) => mockInfoPages[slug],
};
