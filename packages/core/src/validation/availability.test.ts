import { describe, expect, it } from "vitest";
import { createSlotSchema } from "./availability";

function futureDate(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

describe("createSlotSchema", () => {
  it("accepts a valid future slot", () => {
    const result = createSlotSchema.safeParse({
      startTime: futureDate(24),
      durationMinutes: 50,
      sessionType: "bireysel",
      isIntro: false,
      repeatWeeks: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a slot in the past", () => {
    const result = createSlotSchema.safeParse({
      startTime: futureDate(-1),
      durationMinutes: 50,
      sessionType: "bireysel",
      isIntro: false,
      repeatWeeks: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a duration outside 15-240 minutes", () => {
    const result = createSlotSchema.safeParse({
      startTime: futureDate(24),
      durationMinutes: 300,
      sessionType: "bireysel",
      isIntro: false,
      repeatWeeks: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects repeatWeeks above the max", () => {
    const result = createSlotSchema.safeParse({
      startTime: futureDate(24),
      durationMinutes: 50,
      sessionType: "bireysel",
      isIntro: false,
      repeatWeeks: 20,
    });
    expect(result.success).toBe(false);
  });
});
