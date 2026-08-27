import type { z } from "zod";
import type { matchQuizSchema } from "../validation/matching";
import { getApprovedPsychologists } from "../psychologists/service";

type Candidate = Awaited<ReturnType<typeof getApprovedPsychologists>>["items"][number];

export type MatchCriteria = z.infer<typeof matchQuizSchema>;
export type MatchResult = { candidate: Candidate; score: number; reasons: string[] };

/** Rule-based scoring — no ML involved, just weighted criteria matching. */
export function scorePsychologists(criteria: MatchCriteria, candidates: Candidate[]): MatchResult[] {
  return candidates
    .map((candidate) => {
      let score = 0;
      const reasons: string[] = [];

      if (
        criteria.specialtySlug &&
        candidate.specialties.some((entry) => entry.specialty.slug === criteria.specialtySlug)
      ) {
        score += 3;
        reasons.push("Aradığınız uzmanlık alanında çalışıyor");
      }
      if (
        criteria.maxBudgetTl !== undefined &&
        candidate.sessionPriceTl !== null &&
        candidate.sessionPriceTl <= criteria.maxBudgetTl
      ) {
        score += 2;
        reasons.push("Bütçenize uygun bir seans ücreti sunuyor");
      }
      if (criteria.genderPreference && candidate.gender === criteria.genderPreference) {
        score += 1;
        reasons.push("Tercih ettiğiniz cinsiyette");
      }
      if (criteria.wantsFreeIntro && candidate.introCallEnabled) {
        score += 1;
        reasons.push("Ücretsiz ön görüşme sunuyor");
      }
      if (candidate.ratingAverage && candidate.ratingAverage >= 4.5) {
        score += 1;
        reasons.push("Danışanlarından yüksek puan almış");
      }

      return { candidate, score, reasons };
    })
    .sort((a, b) => b.score - a.score);
}

export async function getTopMatches(criteria: MatchCriteria, limit = 3) {
  const { items } = await getApprovedPsychologists({ pageSize: 200 });
  return scorePsychologists(criteria, items)
    .filter((entry) => entry.score > 0)
    .slice(0, limit);
}
