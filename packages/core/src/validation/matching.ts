import { z } from "zod";

export const matchQuizSchema = z.object({
  specialtySlug: z.string().trim().optional(),
  maxBudgetTl: z.number().int().positive().optional(),
  genderPreference: z.enum(["kadin", "erkek"]).optional(),
  wantsFreeIntro: z.boolean().default(false),
});
