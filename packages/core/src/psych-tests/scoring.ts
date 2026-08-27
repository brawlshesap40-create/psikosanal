export type ResultBand = { min: number; max: number; label: string; description: string };

/**
 * Zero DB imports on purpose — this is imported directly by client components
 * (the test-taking flow) via the `@psikosanal/core/psych-tests/scoring` subpath,
 * bypassing `service.ts` so the Postgres driver never ends up in a client bundle.
 */
export function scoreAnswers(answers: number[], resultBands: ResultBand[]) {
  const total = answers.reduce((sum, value) => sum + value, 0);
  const band =
    resultBands.find((entry) => total >= entry.min && total <= entry.max) ??
    resultBands[resultBands.length - 1];
  return { total, band };
}
