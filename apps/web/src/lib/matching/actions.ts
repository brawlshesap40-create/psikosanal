"use server";

import { matchQuizSchema } from "@/lib/validation/matching";
import { matchingService } from "@psikosanal/core";

export type MatchFormState =
  | { error?: string; results?: Awaited<ReturnType<typeof matchingService.getTopMatches>> }
  | undefined;

export async function runMatchQuizAction(
  _prevState: MatchFormState,
  formData: FormData
): Promise<MatchFormState> {
  const maxBudgetRaw = String(formData.get("maxBudgetTl") ?? "").trim();
  const genderRaw = String(formData.get("genderPreference") ?? "").trim();

  const parsed = matchQuizSchema.safeParse({
    specialtySlug: String(formData.get("specialtySlug") ?? "").trim() || undefined,
    maxBudgetTl: maxBudgetRaw ? Number(maxBudgetRaw) : undefined,
    genderPreference: genderRaw || undefined,
    wantsFreeIntro: formData.get("wantsFreeIntro") === "on",
  });
  if (!parsed.success) {
    return { error: "Bilgileri kontrol edin." };
  }

  const results = await matchingService.getTopMatches(parsed.data);
  return { results };
}
