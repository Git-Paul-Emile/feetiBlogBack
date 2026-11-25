import { prisma } from "../../lib/prisma.js";
import type { ArticleDto, ArticleSectionDto, CategoryDto, InfoPageDto, TutorialDto } from "./content.dto.js";
import type { ArticleInput } from "./content.schemas.js";

export interface ContentRepository {
  findArticles(): Promise<readonly ArticleDto[]>;
  findArticleBySlug(slug: string): Promise<ArticleDto | undefined>;
  findTutorials(): Promise<readonly TutorialDto[]>;
  findInfoPageBySlug(slug: string): Promise<InfoPageDto | undefined>;
  findCategories(): Promise<readonly CategoryDto[]>;
  createArticle(input: ArticleInput & { slug: string; read: string }): Promise<ArticleDto>;
  updateArticle(input: {
    currentSlug: string;
    article: ArticleInput & { slug: string; read: string };
  }): Promise<ArticleDto | undefined>;
  deleteArticle(slug: string): Promise<boolean>;
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
    imagePublicId: article.imagePublicId,
    sections: article.sections.map((section) => ({
      title: section.title,
      paragraphs: section.paragraphs,
    })),
  };
}

function toArticleSections(input: ArticleInput["sections"]): ArticleSectionDto[] {
  return input.map((section) => ({ title: section.title, paragraphs: section.paragraphs }));
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
  async findCategories() {
    return prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    });
  },
  async createArticle(input) {
    const lastArticle = await prisma.blogArticle.findFirst({
      orderBy: { position: "desc" },
      select: { position: true },
    });
    const article = await prisma.blogArticle.create({
      data: {
        slug: input.slug,
        position: (lastArticle?.position ?? 0) + 1,
        categorySlug: input.categorySlug,
        readTime: input.read,
        title: input.title,
        excerpt: input.excerpt,
        lead: input.lead,
        imageUrl: input.imageUrl,
        imagePublicId: input.imagePublicId ?? "",
        sections: {
          create: input.sections.map((section, position) => ({ ...section, position })),
        },
      },
      include: articleInclude,
    });
    return toArticleDto(article);
  },
  async updateArticle({ currentSlug, article: input }) {
    const exists = await prisma.blogArticle.findUnique({
      where: { slug: currentSlug },
      select: { id: true },
    });
    if (!exists) return undefined;

    const article = await prisma.blogArticle.update({
      where: { slug: currentSlug },
      data: {
        slug: input.slug,
        categorySlug: input.categorySlug,
        readTime: input.read,
        title: input.title,
        excerpt: input.excerpt,
        lead: input.lead,
        imageUrl: input.imageUrl,
        ...(input.imagePublicId !== undefined ? { imagePublicId: input.imagePublicId } : {}),
        sections: {
          deleteMany: {},
          create: input.sections.map((section, position) => ({ ...section, position })),
        },
      },
      include: articleInclude,
    });
    return toArticleDto(article);
  },
  async deleteArticle(slug) {
    const result = await prisma.blogArticle.deleteMany({ where: { slug } });
    return result.count > 0;
  },
};
