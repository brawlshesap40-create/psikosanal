"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { verifyAdminSession, verifyPsikologSession } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { psychologistProfiles } from "@/lib/db/schema";
import { answerQuestionSchema, submitQuestionSchema } from "@/lib/validation/question";
import { questionsService, DomainError } from "@psikosanal/core";

export type QuestionFormState = { error?: string; success?: boolean } | undefined;

export async function submitQuestionAction(
  _prevState: QuestionFormState,
  formData: FormData
): Promise<QuestionFormState> {
  const parsed = submitQuestionSchema.safeParse({
    questionText: String(formData.get("questionText") ?? "").trim(),
    isAnonymous: formData.get("isAnonymous") === "on",
    askerName: String(formData.get("askerName") ?? "").trim() || undefined,
    askerEmail: String(formData.get("askerEmail") ?? "").trim() || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Sorunuzu kontrol edin." };
  }

  await questionsService.submitQuestion(parsed.data);
  revalidatePath("/soru-sor");
  return { success: true };
}

async function requireOwnPsychologistId() {
  const session = await verifyPsikologSession();
  const profile = await db.query.psychologistProfiles.findFirst({
    where: eq(psychologistProfiles.userId, session.userId),
  });
  if (!profile) throw new Error("Psikolog profili bulunamadı");
  return profile.id;
}

export async function answerQuestionAction(
  questionId: number,
  _prevState: QuestionFormState,
  formData: FormData
): Promise<QuestionFormState> {
  const psychologistId = await requireOwnPsychologistId();

  const parsed = answerQuestionSchema.safeParse({
    answerText: String(formData.get("answerText") ?? "").trim(),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Cevabınızı kontrol edin." };
  }

  try {
    await questionsService.answerQuestion(questionId, psychologistId, parsed.data.answerText);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/psikolog/sorular");
  return { success: true };
}

export async function publishQuestionAction(questionId: number) {
  await verifyAdminSession();
  await questionsService.publishQuestion(questionId);
  revalidatePath("/admin/sorular");
  revalidatePath("/soru-sor");
}

export async function unpublishQuestionAction(questionId: number) {
  await verifyAdminSession();
  await questionsService.unpublishQuestion(questionId);
  revalidatePath("/admin/sorular");
  revalidatePath("/soru-sor");
}
