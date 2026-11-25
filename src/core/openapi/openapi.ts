import { z } from "zod";
import { apiErrorResponseSchema, apiSuccessResponseSchema } from "../http/apiResponse.js";
import {
  articlesQuerySchema,
  articleSchema,
  infoPageSchema,
  tutorialsQuerySchema,
  tutorialSchema,
} from "../../features/content/content.schemas.js";
import { productSchema, productsQuerySchema } from "../../features/products/products.schemas.js";

interface OpenApiObjectSchema {
  properties?: Record<string, Record<string, unknown>>;
  required?: string[];
}

function toOpenApiSchema(schema: z.ZodType): Record<string, unknown> {
  return z.toJSONSchema(schema, { target: "openapi-3.0", io: "input" }) as unknown as Record<string, unknown>;
}

function queryParameters(schema: z.ZodType) {
  const objectSchema = toOpenApiSchema(schema) as unknown as OpenApiObjectSchema;
  const requiredParameters = new Set(objectSchema.required ?? []);

  return Object.entries(objectSchema.properties ?? {}).map(([name, parameterSchema]) => ({
    name,
    in: "query",
    required: requiredParameters.has(name),
    schema: parameterSchema,
  }));
}

function successSchema(dataSchema: z.ZodType) {
  return apiSuccessResponseSchema(dataSchema);
}

function paginatedSchema(itemSchema: z.ZodType) {
  return z.strictObject({
    items: z.array(itemSchema),
    pagination: z.strictObject({
      total: z.number().int(),
      page: z.number().int(),
      limit: z.number().int(),
      hasNext: z.boolean(),
    }),
  });
}

function jsonResponse(description: string, schema: z.ZodType) {
  return {
    description,
    content: {
      "application/json": {
        schema: toOpenApiSchema(schema),
      },
    },
  };
}

const standardErrors = {
  "400": jsonResponse("Paramètres de requête invalides.", apiErrorResponseSchema),
  "403": jsonResponse("Origine non autorisée.", apiErrorResponseSchema),
  "429": jsonResponse("Limite de requêtes atteinte.", apiErrorResponseSchema),
  "500": jsonResponse("Erreur interne.", apiErrorResponseSchema),
};

function listResponses(description: string, itemSchema: z.ZodType) {
  return {
    "200": jsonResponse(description, successSchema(paginatedSchema(itemSchema))),
    ...standardErrors,
  };
}

function detailResponses(description: string, itemSchema: z.ZodType) {
  return {
    "200": jsonResponse(description, successSchema(itemSchema)),
    "404": jsonResponse("Ressource introuvable.", apiErrorResponseSchema),
    "400": standardErrors["400"],
    "403": standardErrors["403"],
    "429": standardErrors["429"],
    "500": standardErrors["500"],
  };
}

const slugParameter = {
  name: "slug",
  in: "path",
  required: true,
  schema: toOpenApiSchema(z.string().regex(/^[a-z0-9-]{1,100}$/)),
};

const healthDataSchema = z.strictObject({
  status: z.literal("ok"),
  mode: z.literal("database"),
});

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Feeti Blog API",
    version: "1.0.0",
    description: "API de lecture autonome alimentée par la base FeetiBlog.",
  },
  servers: [{ url: "/" }],
  paths: {
    "/api/v1/openapi.json": {
      get: {
        tags: ["Documentation"],
        summary: "Afficher le contrat OpenAPI.",
        responses: {
          "200": {
            description: "Spécification OpenAPI.",
            content: { "application/json": { schema: { type: "object" } } },
          },
          "403": standardErrors["403"],
          "429": standardErrors["429"],
          "500": standardErrors["500"],
        },
      },
    },
    "/api/v1/health": {
      get: {
        tags: ["Health"],
        summary: "Vérifier la disponibilité de l'API et de sa base de données.",
        responses: {
          "200": jsonResponse("API disponible.", successSchema(healthDataSchema)),
          "403": standardErrors["403"],
          "429": standardErrors["429"],
          "500": standardErrors["500"],
        },
      },
    },
    "/api/v1/products": {
      get: {
        tags: ["Products"],
        summary: "Lister les produits.",
        parameters: queryParameters(productsQuerySchema),
        responses: listResponses("Liste paginée des produits.", productSchema),
      },
    },
    "/api/v1/products/{slug}": {
      get: {
        tags: ["Products"],
        summary: "Lire un produit par son slug.",
        parameters: [slugParameter],
        responses: detailResponses("Produit demandé.", productSchema),
      },
    },
    "/api/v1/content/articles": {
      get: {
        tags: ["Content"],
        summary: "Lister les articles.",
        parameters: queryParameters(articlesQuerySchema),
        responses: listResponses("Liste paginée des articles.", articleSchema),
      },
    },
    "/api/v1/content/articles/{slug}": {
      get: {
        tags: ["Content"],
        summary: "Lire un article par son slug.",
        parameters: [slugParameter],
        responses: detailResponses("Article demandé.", articleSchema),
      },
    },
    "/api/v1/content/tutorials": {
      get: {
        tags: ["Content"],
        summary: "Lister les tutoriels.",
        parameters: queryParameters(tutorialsQuerySchema),
        responses: listResponses("Liste paginée des tutoriels.", tutorialSchema),
      },
    },
    "/api/v1/content/pages/{slug}": {
      get: {
        tags: ["Content"],
        summary: "Lire une page d'information par son slug.",
        parameters: [slugParameter],
        responses: detailResponses("Page d'information demandée.", infoPageSchema),
      },
    },
  },
};
