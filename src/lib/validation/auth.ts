import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(1, "Şifre gereklidir"),
});

export const registerDanisanSchema = z.object({
  fullName: z.string().trim().min(2, "Ad soyad gereklidir"),
  email: z.email("Geçerli bir e-posta adresi girin"),
  phone: z.string().trim().min(10, "Geçerli bir telefon numarası girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
});

export const registerPsikologSchema = z.object({
  fullName: z.string().trim().min(2, "Ad soyad gereklidir"),
  email: z.email("Geçerli bir e-posta adresi girin"),
  phone: z.string().trim().min(10, "Geçerli bir telefon numarası girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
  title: z.string().trim().min(2, "Unvan gereklidir"),
  experienceYears: z.number().int().min(0).max(70),
  city: z.string().trim().min(2, "Şehir gereklidir"),
  bio: z.string().trim().min(20, "Kendinizden en az 20 karakterle bahsedin"),
});
