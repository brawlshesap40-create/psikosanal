import { z } from "zod";

export const bookAppointmentSchema = z.object({
  slotId: z.number().int().positive(),
  clientNote: z.string().trim().max(1000).optional(),
});
