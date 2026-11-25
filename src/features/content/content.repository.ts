import { prisma } from "../../lib/prisma.js";
import type { ArticleDto, InfoPageDto, TutorialDto } from "./content.dto.js";

export interface ContentRepository {
  findArticles(): Promise<readonly ArticleDto[]>;
  findArticleBySlug(slug: string): Promise<ArticleDto | undefined>;
  findTutorials(): Promise<readonly TutorialDto[]>;
  findInfoPageBySlug(slug: string): Promise<InfoPageDto | undefined>;
}

const articleInclude = {
  category: true,
  sections: { orderBy: { position: "asc" as const } },
};

async function findArticleRecords() {
  return prisma.blogArticle.findMany({
    orderBy: { position: "asc" },
    include: articleInclude,
  });
}

async function findArticleRecordBySlug(slug: string) {
  return prisma.blogArticle.findUnique({ where: { slug }, include: articleInclude });
}

type ArticleRecord = Awaited<ReturnType<typeof findArticleRecords>>[number];

function toArticleDto(article: ArticleRecord): ArticleDto {
  return {
    slug: article.slug,
    category: article.category.name,
    read: article.readTime,
    title: article.title,
    excerpt: article.excerpt,
    lead: article.lead,
    image: article.imageUrl,
    sections: article.sections.map((section) => ({
      title: section.title,
      paragraphs: section.paragraphs,
    })),
  };
}

async function findTutorialRecords() {
  return prisma.blogTutorial.findMany({ orderBy: { position: "asc" } });
}

function toTutorialDto(tutorial: Awaited<ReturnType<typeof findTutorialRecords>>[number]): TutorialDto {
  return {
    duration: tutorial.duration,
    level: tutorial.level,
    title: tutorial.title,
    description: tutorial.description,
    image: tutorial.imageUrl,
  };
}

async function findInfoPageRecordBySlug(slug: string) {
  return prisma.blogInfoPage.findUnique({ where: { slug } });
}

export const databaseContentRepository: ContentRepository = {
  async findArticles() {
    return (await findArticleRecords()).map(toArticleDto);
  },
  async findArticleBySlug(slug) {
    const article = await findArticleRecordBySlug(slug);
    return article ? toArticleDto(article) : undefined;
  },
  async findTutorials() {
    return (await findTutorialRecords()).map(toTutorialDto);
  },
  async findInfoPageBySlug(slug) {
    const page = await findInfoPageRecordBySlug(slug);
    if (!page) return undefined;

    return {
      eyebrow: page.eyebrow,
      title: page.title,
      intro: page.intro,
      sections: page.sections,
    };
  },
};
