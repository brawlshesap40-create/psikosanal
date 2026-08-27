import { describe, expect, it } from "vitest";
import { scorePsychologists } from "./service";

function candidate(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    sessionPriceTl: 800,
    gender: "kadin",
    introCallEnabled: false,
    ratingAverage: 0,
    specialties: [{ specialty: { id: 1, slug: "kaygi", name: "Kaygı" } }],
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe("scorePsychologists", () => {
  it("adds points for each matching criterion", () => {
    const [result] = scorePsychologists(
      { specialtySlug: "kaygi", maxBudgetTl: 1000, genderPreference: "kadin", wantsFreeIntro: true },
      [candidate({ introCallEnabled: true })]
    );
    expect(result.score).toBe(3 + 2 + 1 + 1);
    expect(result.reasons).toHaveLength(4);
  });

  it("ranks the stronger match first", () => {
    const weak = candidate({ id: 1, specialties: [] });
    const strong = candidate({ id: 2 });
    const [first] = scorePsychologists({ specialtySlug: "kaygi", wantsFreeIntro: false }, [
      weak,
      strong,
    ]);
    expect(first.candidate.id).toBe(2);
  });

  it("scores zero when nothing matches", () => {
    const [result] = scorePsychologists({ specialtySlug: "baska-alan", wantsFreeIntro: false }, [
      candidate(),
    ]);
    expect(result.score).toBe(0);
  });
});
