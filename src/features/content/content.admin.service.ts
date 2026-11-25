import { randomUUID } from "node:crypto";
import { ConflictError } from "../../core/errors/ConflictError.js";
import { NotFoundError } from "../../core/errors/NotFoundError.js";
import { queryCollection } from "../../core/http/pagination.js";
import { databaseContentRepository } from "./content.repository.js";
import type { ArticleDto, CategoryDto } from "./content.dto.js";
import type { ArticleInput, CategoriesQuery } from "./content.schemas.js";

function createSlug(title: string): string {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `article-${randomUUID().slice(0, 8)}`;
}

function estimateReadTime(input: ArticleInput): string {
  const text = [
    input.title,
    input.excerpt,
    input.lead,
    ...input.sections.flatMap((section) => [section.title, ...section.paragraphs]),
  ].join(" ");
  const minutes = Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
  return `${minutes} min`;
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function listCategories(query: CategoriesQuery): Promise<{
  items: CategoryDto[];
  pagination: { total: number; page: number; limit: number; hasNext: boolean };
}> {
  return queryCollection(await databaseContentRepository.findCategories(), {
    query,
    searchFields: [(category) => category.name, (category) => category.slug],
    sortFields: { name: (category) => category.name, slug: (category) => category.slug },
  });
}

async function ensureCategoryExists(categorySlug: string): Promise<void> {
  const categories = await databaseContentRepository.findCategories();
  if (!categories.some((category) => category.slug === categorySlug)) {
    throw new NotFoundError("Cette catégorie n'existe pas.");
  }
}

export async function createArticle(input: ArticleInput): Promise<ArticleDto> {
  await ensureCategoryExists(input.categorySlug);
  const slug = input.slug ?? createSlug(input.title);
  try {
    return await databaseContentRepository.createArticle({ ...input, slug, read: estimateReadTime(input) });
  } catch (error) {
    if (isUniqueConstraintError(error))
      throw new ConflictError("Un article utilise déjà ce slug ou sa position est déjà prise.");
    throw error;
  }
}

export async function updateArticle(slug: string, input: ArticleInput): Promise<ArticleDto> {
  await ensureCategoryExists(input.categorySlug);
  try {
    const updatedArticle = await databaseContentRepository.updateArticle({
      currentSlug: slug,
      article: { ...input, slug: input.slug ?? createSlug(input.title), read: estimateReadTime(input) },
    });
    if (!updatedArticle) throw new NotFoundError("Cet article est introuvable.");
    return updatedArticle;
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new ConflictError("Un autre article utilise déjà ce slug.");
    throw error;
  }
}

export async function deleteArticle(slug: string): Promise<void> {
  const deleted = await databaseContentRepository.deleteArticle(slug);
  if (!deleted) throw new NotFoundError("Cet article est introuvable.");
}
