import { z } from "zod";

export const psychologistProfileSchema = z.object({
  title: z.string().trim().min(2, "Unvan gereklidir"),
  bio: z.string().trim().min(20, "Kendinizden en az 20 karakterle bahsedin"),
  experienceYears: z.number().int().min(0).max(70),
  sessionPriceTl: z.number().int().min(0),
  city: z.string().trim().min(2, "Şehir gereklidir"),
  onlineAvailable: z.boolean(),
  inPersonAvailable: z.boolean(),
  specialtyIds: z.array(z.number().int()),
  gender: z.enum(["kadin", "erkek", "belirtilmemis"]),
  languages: z.array(z.string()).min(1, "En az bir dil seçin"),
  approaches: z.array(z.string()),
  introCallEnabled: z.boolean(),
});
