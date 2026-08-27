import { z } from "zod";

export const createBlogPostSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  title: z.string().trim().min(3).max(200),
  excerpt: z.string().trim().min(10).max(400),
  content: z.string().trim().min(20),
  coverImageUrl: z.string().trim().max(2000).optional(),
  authorName: z.string().trim().min(2).max(150),
});
