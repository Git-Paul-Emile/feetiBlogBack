import { NotFoundError } from "../../core/errors/NotFoundError.js";
import { queryCollection } from "../../core/http/pagination.js";
import type { ProductDto } from "./products.dto.js";
import { mockProductsRepository } from "./products.repository.js";
import type { ProductsQuery } from "./products.schemas.js";

export function listProducts(query: ProductsQuery) {
  return queryCollection(mockProductsRepository.findAll(), {
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

export function getProductBySlug(slug: string): ProductDto {
  const product = mockProductsRepository.findBySlug(slug);
  if (!product) throw new NotFoundError("Ce produit est introuvable.");
  return product;
}
