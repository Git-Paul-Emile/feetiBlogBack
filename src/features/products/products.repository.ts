import { prisma } from "../../lib/prisma.js";
import type { ProductDto } from "./products.dto.js";

export interface ProductsRepository {
  findAll(): Promise<readonly ProductDto[]>;
  findBySlug(slug: string): Promise<ProductDto | undefined>;
}

const productInclude = {
  features: { orderBy: { position: "asc" as const } },
  steps: { orderBy: { position: "asc" as const } },
};

async function findProductRecords() {
  return prisma.blogProduct.findMany({ orderBy: { position: "asc" }, include: productInclude });
}

async function findProductRecordBySlug(slug: string) {
  return prisma.blogProduct.findUnique({ where: { slug }, include: productInclude });
}

type ProductRecord = Awaited<ReturnType<typeof findProductRecords>>[number];

function toProductDto(product: ProductRecord): ProductDto {
  return {
    slug: product.slug,
    index: product.indexLabel,
    name: product.name,
    eyebrow: product.eyebrow,
    title: product.title,
    description: product.description,
    accent: product.accent,
    soft: product.soft,
    image: product.imageUrl,
    imageAlt: product.imageAlt,
    stat: product.stat,
    outcome: product.outcome,
    features: product.features.map(({ title, description }) => ({ title, description })),
    steps: product.steps.map(({ title, description }) => ({ title, description })),
    quote: product.quote,
    quoteAttribution: product.quoteAttribution,
    cta: product.cta,
    contact: product.contact,
  };
}

export const databaseProductsRepository: ProductsRepository = {
  async findAll() {
    return (await findProductRecords()).map(toProductDto);
  },
  async findBySlug(slug) {
    const product = await findProductRecordBySlug(slug);
    return product ? toProductDto(product) : undefined;
  },
};
