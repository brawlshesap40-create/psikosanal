import { z } from "zod";

export const createPackageSchema = z.object({
  name: z.string().trim().min(2, "Paket adı gereklidir"),
  sessionCount: z.number().int().min(2, "En az 2 seans içermelidir"),
  priceTl: z.number().int().min(1, "Geçerli bir fiyat girin"),
});
