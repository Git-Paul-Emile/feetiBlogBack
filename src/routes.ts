import { Router } from "express";
import { openApiDocument } from "./core/openapi/openapi.js";
import { contentRoutes } from "./features/content/content.routes.js";
import { healthRoutes } from "./features/health/health.routes.js";
import { productsRoutes } from "./features/products/products.routes.js";

export const apiRoutes = Router();

apiRoutes.get("/openapi.json", (_request, response) => {
  response.status(200).json(openApiDocument);
});
apiRoutes.use("/health", healthRoutes);
apiRoutes.use("/products", productsRoutes);
apiRoutes.use("/content", contentRoutes);
