import { describe, expect, it } from "vitest";
import { scoreAnswers } from "./service";

const bands = [
  { min: 0, max: 5, label: "Düşük", description: "..." },
  { min: 6, max: 10, label: "Orta", description: "..." },
  { min: 11, max: 15, label: "Yüksek", description: "..." },
];

describe("scoreAnswers", () => {
  it("sums answers and picks the matching band", () => {
    expect(scoreAnswers([1, 1, 1], bands).band.label).toBe("Düşük");
    expect(scoreAnswers([3, 3, 3], bands).band.label).toBe("Orta");
    expect(scoreAnswers([5, 5, 4], bands).band.label).toBe("Yüksek");
  });

  it("falls back to the last band when total exceeds every range", () => {
    expect(scoreAnswers([5, 5, 5, 5, 5], bands).band.label).toBe("Yüksek");
  });

  it("returns the raw total alongside the band", () => {
    expect(scoreAnswers([2, 2, 2], bands).total).toBe(6);
  });
});
