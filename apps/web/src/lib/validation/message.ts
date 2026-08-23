import { z } from "zod";

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1, "Mesaj boş olamaz").max(2000),
});
