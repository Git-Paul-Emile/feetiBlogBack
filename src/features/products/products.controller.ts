import { asyncHandler } from "../../core/http/asyncHandler.js";
import { apiSuccessResponse } from "../../core/http/apiResponse.js";
import { getValidatedInput } from "../../core/middlewares/validate.js";
import { getProductBySlug, listProducts } from "./products.service.js";
import type { ProductDto } from "./products.dto.js";
import type { ProductsQuery } from "./products.schemas.js";

export const productsController = {
  list: asyncHandler((_request, response) => {
    const query = getValidatedInput<ProductsQuery>(response, "query");
    const result = listProducts(query);
    response.status(200).json(apiSuccessResponse(result, "Les produits ont été récupérés."));
  }),

  getBySlug: asyncHandler((_request, response) => {
    const { slug } = getValidatedInput<{ slug: string }>(response, "params");
    const product: ProductDto = getProductBySlug(slug);
    response.status(200).json(apiSuccessResponse(product, "Le produit a été récupéré."));
  }),
};
