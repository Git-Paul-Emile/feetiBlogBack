import { NotFoundError } from "../../core/errors/NotFoundError.js";
import { queryCollection } from "../../core/http/pagination.js";
import type { ProductDto } from "./products.dto.js";
import { databaseProductsRepository } from "./products.repository.js";
import type { ProductsQuery } from "./products.schemas.js";

export async function listProducts(query: ProductsQuery) {
  return queryCollection(await databaseProductsRepository.findAll(), {
    query,
    filter: (product) => query.slug === undefined || product.slug === query.slug,
    searchFields: [
      (product) => product.slug,
      (product) => product.name,
      (product) => product.title,
      (product) => product.description,
    ],
    sortFields: {
      slug: (product) => product.slug,
      index: (product) => product.index,
      name: (product) => product.name,
      title: (product) => product.title,
    },
  });
}

export async function getProductBySlug(slug: string): Promise<ProductDto> {
  const product = await databaseProductsRepository.findBySlug(slug);
  if (!product) throw new NotFoundError("Ce produit est introuvable.");
  return product;
}
