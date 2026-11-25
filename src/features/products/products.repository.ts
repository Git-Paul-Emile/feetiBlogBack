import { z } from "zod";
import { products } from "./products.data.js";
import type { ProductDto } from "./products.dto.js";
import { productSchema } from "./products.schemas.js";

export interface ProductsRepository {
  findAll(): readonly ProductDto[];
  findBySlug(slug: string): ProductDto | undefined;
}

const mockProducts = z.array(productSchema).parse(products);

export const mockProductsRepository: ProductsRepository = {
  findAll: () => mockProducts,
  findBySlug: (slug) => mockProducts.find((product) => product.slug === slug),
};
