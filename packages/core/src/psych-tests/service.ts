import { asc, eq } from "drizzle-orm";
import { db } from "@psikosanal/db";
import { psychTestQuestions, psychTests } from "@psikosanal/db/schema";
import { testNotFound } from "./errors";

export * from "./scoring";

export async function listTests() {
  return db.query.psychTests.findMany();
}

export async function getTestBySlugWithQuestions(slug: string) {
  const test = await db.query.psychTests.findFirst({
    where: eq(psychTests.slug, slug),
    with: { questions: { orderBy: [asc(psychTestQuestions.order)] } },
  });
  if (!test) throw testNotFound();
  return test;
}
