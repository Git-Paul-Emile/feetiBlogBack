import { z } from "zod";

export const commonCollectionQueryShape = {
  page: z
    .string()
    .regex(/^[1-9]\d{0,8}$/)
    .optional()
    .describe("Numéro de page, à partir de 1."),
  limit: z
    .string()
    .regex(/^(?:[1-9]|[1-9]\d|100)$/)
    .optional()
    .describe("Nombre d'éléments par page, entre 1 et 100."),
  search: z.string().max(100).optional().describe("Recherche textuelle."),
};

export function createCollectionQuerySchema<
  const SortFields extends readonly [string, ...string[]],
  const Filters extends z.ZodRawShape,
>(sortFields: SortFields, filters: Filters) {
  return z.strictObject({
    ...commonCollectionQueryShape,
    ...filters,
    sort: z
      .enum(sortFields)
      .optional()
      .describe("Champ de tri autorisé. Préfixer par - pour l'ordre décroissant."),
  });
}

export const slugParamsSchema = z.strictObject({
  slug: z.string().regex(/^[a-z0-9-]{1,100}$/),
});
