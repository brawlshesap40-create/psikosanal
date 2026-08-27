import { z } from "zod";

export const createDiscountCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .transform((value) => value.toUpperCase()),
  kind: z.enum(["yuzde", "tutar"]),
  value: z.number().int().positive(),
  appliesTo: z.enum(["hepsi", "seans", "paket"]).default("hepsi"),
  maxUses: z.number().int().positive().optional(),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
});
