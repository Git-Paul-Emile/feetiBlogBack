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
import {
  adminLoginSchema,
  adminRegistrationSchema,
  emailVerificationSchema,
} from "../../features/auth/auth.schemas.js";
import {
  articleWriteSchema,
  categoriesQuerySchema,
  categorySchema,
} from "../../features/content/content.schemas.js";

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

const adminSessionSchema = z.strictObject({
  admin: z.strictObject({ id: z.string(), name: z.string() }),
});
const registrationResponseSchema = z.strictObject({ emailConfirmationRequired: z.literal(true) });
const uploadResponseSchema = z.strictObject({ publicId: z.string(), secureUrl: z.string().url() });
const authErrors = {
  ...standardErrors,
  "401": jsonResponse("Authentification ou invitation invalide.", apiErrorResponseSchema),
  "409": jsonResponse("Un compte ou un article existe déjà.", apiErrorResponseSchema),
  "422": jsonResponse("Les données envoyées ne sont pas acceptées.", apiErrorResponseSchema),
  "503": jsonResponse("Le service n'est pas configuré.", apiErrorResponseSchema),
};
const articleMutationErrors = {
  ...standardErrors,
  "401": jsonResponse("Session administrateur requise.", apiErrorResponseSchema),
  "404": jsonResponse("Ressource introuvable.", apiErrorResponseSchema),
  "409": jsonResponse("Slug ou position déjà utilisé.", apiErrorResponseSchema),
  "422": jsonResponse("Les données envoyées ne sont pas acceptées.", apiErrorResponseSchema),
};

function requestBody(schema: z.ZodType) {
  return {
    required: true,
    content: { "application/json": { schema: toOpenApiSchema(schema) } },
  };
}

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Feeti Blog API",
    version: "1.0.0",
    description: "API Feeti Blog alimentée par la base et protégée pour la gestion administrateur.",
  },
  servers: [{ url: "/" }],
  components: {
    securitySchemes: {
      adminSession: {
        type: "apiKey",
        in: "cookie",
        name: "feeti_blog_session",
        description: "Cookie de session HttpOnly créé après la connexion administrateur.",
      },
    },
  },
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
    "/api/v1/auth/admin-registrations": {
      post: {
        tags: ["Auth"],
        summary: "Créer un compte administrateur avec invitation et confirmation e-mail.",
        requestBody: requestBody(adminRegistrationSchema),
        responses: {
          "202": jsonResponse("Confirmation envoyée par e-mail.", successSchema(registrationResponseSchema)),
          "400": standardErrors["400"],
          "401": authErrors["401"],
          "403": standardErrors["403"],
          "409": authErrors["409"],
          "429": standardErrors["429"],
          "503": authErrors["503"],
          "500": standardErrors["500"],
        },
      },
    },
    "/api/v1/auth/email-verifications": {
      post: {
        tags: ["Auth"],
        summary: "Confirmer l'adresse e-mail administrateur et ouvrir une session.",
        requestBody: requestBody(emailVerificationSchema),
        responses: {
          "200": jsonResponse("Adresse confirmée.", successSchema(adminSessionSchema)),
          "400": standardErrors["400"],
          "401": authErrors["401"],
          "403": standardErrors["403"],
          "429": standardErrors["429"],
          "500": standardErrors["500"],
        },
      },
    },
    "/api/v1/auth/sessions": {
      post: {
        tags: ["Auth"],
        summary: "Ouvrir une session administrateur.",
        requestBody: requestBody(adminLoginSchema),
        responses: {
          "200": jsonResponse("Session ouverte. Le cookie est HttpOnly.", successSchema(adminSessionSchema)),
          "400": standardErrors["400"],
          "401": authErrors["401"],
          "403": standardErrors["403"],
          "429": standardErrors["429"],
          "500": standardErrors["500"],
        },
      },
    },
    "/api/v1/auth/session": {
      get: {
        tags: ["Auth"],
        summary: "Lire la session administrateur active.",
        security: [{ adminSession: [] }],
        responses: {
          "200": jsonResponse("Session active.", successSchema(adminSessionSchema)),
          "401": authErrors["401"],
          "403": standardErrors["403"],
          "429": standardErrors["429"],
          "500": standardErrors["500"],
        },
      },
      delete: {
        tags: ["Auth"],
        summary: "Fermer la session administrateur.",
        responses: {
          "200": jsonResponse(
            "Session fermée.",
            successSchema(z.strictObject({ loggedOut: z.literal(true) })),
          ),
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
      post: {
        tags: ["Content"],
        summary: "Créer un article, réservé à un administrateur.",
        security: [{ adminSession: [] }],
        requestBody: requestBody(articleWriteSchema),
        responses: {
          "201": jsonResponse("Article créé.", successSchema(articleSchema)),
          "400": standardErrors["400"],
          "401": articleMutationErrors["401"],
          "403": standardErrors["403"],
          "404": articleMutationErrors["404"],
          "409": articleMutationErrors["409"],
          "429": standardErrors["429"],
          "500": standardErrors["500"],
        },
      },
    },
    "/api/v1/content/articles/{slug}": {
      get: {
        tags: ["Content"],
        summary: "Lire un article par son slug.",
        parameters: [slugParameter],
        responses: detailResponses("Article demandé.", articleSchema),
      },
      put: {
        tags: ["Content"],
        summary: "Remplacer un article, réservé à un administrateur.",
        security: [{ adminSession: [] }],
        parameters: [slugParameter],
        requestBody: requestBody(articleWriteSchema),
        responses: {
          "200": jsonResponse("Article modifié.", successSchema(articleSchema)),
          "400": standardErrors["400"],
          "401": articleMutationErrors["401"],
          "403": standardErrors["403"],
          "404": articleMutationErrors["404"],
          "409": articleMutationErrors["409"],
          "429": standardErrors["429"],
          "500": standardErrors["500"],
        },
      },
      delete: {
        tags: ["Content"],
        summary: "Supprimer un article, réservé à un administrateur.",
        security: [{ adminSession: [] }],
        parameters: [slugParameter],
        responses: {
          "204": { description: "Article supprimé." },
          "401": articleMutationErrors["401"],
          "403": standardErrors["403"],
          "404": articleMutationErrors["404"],
          "429": standardErrors["429"],
          "500": standardErrors["500"],
        },
      },
    },
    "/api/v1/content/categories": {
      get: {
        tags: ["Content"],
        summary: "Lister les catégories paginées pour le formulaire admin.",
        parameters: queryParameters(categoriesQuerySchema),
        responses: listResponses("Liste paginée des catégories.", categorySchema),
      },
    },
    "/api/v1/content/images": {
      post: {
        tags: ["Content"],
        summary: "Importer une image validée dans Cloudinary, réservé à un administrateur.",
        security: [{ adminSession: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["image"],
                properties: { image: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: {
          "201": jsonResponse("Image importée.", successSchema(uploadResponseSchema)),
          "400": standardErrors["400"],
          "401": articleMutationErrors["401"],
          "403": standardErrors["403"],
          "429": standardErrors["429"],
          "500": standardErrors["500"],
        },
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
