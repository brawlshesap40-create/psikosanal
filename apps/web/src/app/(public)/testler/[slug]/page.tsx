import { notFound } from "next/navigation";
import { getTestBySlugWithQuestions } from "@/lib/psych-tests/queries";
import { TestTakingForm } from "@/components/psych-tests/test-taking-form";
import { DomainError } from "@psikosanal/core";

export default async function TestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let test;
  try {
    test = await getTestBySlugWithQuestions(slug);
  } catch (error) {
    if (error instanceof DomainError) notFound();
    throw error;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">{test.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{test.description}</p>

      <div className="mt-8">
        <TestTakingForm
          questions={test.questions}
          resultBands={test.resultBands}
          relatedSpecialtySlug={test.relatedSpecialtySlug}
        />
      </div>
    </div>
  );
}
