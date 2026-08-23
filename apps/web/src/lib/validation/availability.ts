import { z } from "zod";

export const createSlotSchema = z.object({
  startTime: z.coerce.date().refine((date) => date > new Date(), {
    message: "Geçmiş bir tarih için müsaitlik eklenemez",
  }),
  durationMinutes: z.number().int().min(15).max(240),
  sessionType: z.enum(["bireysel", "cift", "aile", "grup"]),
  isIntro: z.boolean(),
  repeatWeeks: z.number().int().min(1).max(12),
});
