import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@psikosanal/db";
import { publicQuestions } from "@psikosanal/db/schema";
import type { submitQuestionSchema } from "../validation/question";
import type { z } from "zod";
import { questionAlreadyAnswered, questionNotFound } from "./errors";

export async function submitQuestion(input: z.infer<typeof submitQuestionSchema>) {
  const [created] = await db
    .insert(publicQuestions)
    .values({
      questionText: input.questionText,
      isAnonymous: input.isAnonymous,
      askerName: input.isAnonymous ? null : input.askerName || null,
      askerEmail: input.askerEmail || null,
    })
    .returning();
  return created;
}

export async function listUnanswered() {
  return db.query.publicQuestions.findMany({
    where: eq(publicQuestions.status, "bekliyor"),
    orderBy: [desc(publicQuestions.createdAt)],
  });
}

export async function answerQuestion(
  questionId: number,
  psychologistId: number,
  answerText: string
) {
  const question = await db.query.publicQuestions.findFirst({
    where: eq(publicQuestions.id, questionId),
  });
  if (!question) throw questionNotFound();
  if (question.status !== "bekliyor") throw questionAlreadyAnswered();

  await db
    .update(publicQuestions)
    .set({
      answerText,
      answeredByPsychologistId: psychologistId,
      status: "yanitlandi",
      answeredAt: new Date(),
    })
    .where(eq(publicQuestions.id, questionId));
}

export async function listAnsweredForAdmin() {
  return db.query.publicQuestions.findMany({
    where: inArray(publicQuestions.status, ["yanitlandi", "yayinda"]),
    orderBy: [desc(publicQuestions.answeredAt)],
    with: { answeredByPsychologist: { with: { user: true } } },
  });
}

export async function publishQuestion(questionId: number) {
  await db
    .update(publicQuestions)
    .set({ status: "yayinda" })
    .where(eq(publicQuestions.id, questionId));
}

export async function unpublishQuestion(questionId: number) {
  await db
    .update(publicQuestions)
    .set({ status: "yanitlandi" })
    .where(eq(publicQuestions.id, questionId));
}

export async function listPublished() {
  return db.query.publicQuestions.findMany({
    where: eq(publicQuestions.status, "yayinda"),
    orderBy: [desc(publicQuestions.answeredAt)],
    with: { answeredByPsychologist: { with: { user: true } } },
  });
}
