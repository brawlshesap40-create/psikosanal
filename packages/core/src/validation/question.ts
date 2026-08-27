import { z } from "zod";

export const submitQuestionSchema = z.object({
  questionText: z.string().trim().min(10).max(1000),
  isAnonymous: z.boolean().default(false),
  askerName: z.string().trim().max(150).optional(),
  askerEmail: z.string().trim().email().optional().or(z.literal("")),
});

export const answerQuestionSchema = z.object({
  answerText: z.string().trim().min(10).max(2000),
});
