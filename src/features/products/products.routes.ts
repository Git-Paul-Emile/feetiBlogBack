import { Router } from "express";
import { validateInput } from "../../core/middlewares/validate.js";
import { productsController } from "./products.controller.js";
import { productParamsSchema, productsQuerySchema } from "./products.schemas.js";

export const productsRoutes = Router();

productsRoutes.get("/", validateInput("query", productsQuerySchema), productsController.list);
productsRoutes.get("/:slug", validateInput("params", productParamsSchema), productsController.getBySlug);
