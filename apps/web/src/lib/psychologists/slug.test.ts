import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("converts Turkish characters to ASCII equivalents", () => {
    expect(slugify("Ayşe Öztürk")).toBe("ayse-ozturk");
  });

  it("handles İ/I and diacritics", () => {
    expect(slugify("Çağlar Güneş")).toBe("caglar-gunes");
  });

  it("collapses whitespace and trims dashes", () => {
    expect(slugify("  Mehmet   Yılmaz  ")).toBe("mehmet-yilmaz");
  });

  it("strips non-alphanumeric characters", () => {
    expect(slugify("Dr. Ali (Psikolog)!")).toBe("dr-ali-psikolog");
  });
});
