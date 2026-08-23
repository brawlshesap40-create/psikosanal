import { describe, expect, it } from "vitest";
import { createReviewSchema } from "./review";

describe("createReviewSchema", () => {
  it("accepts a valid review", () => {
    const result = createReviewSchema.safeParse({
      appointmentId: 1,
      rating: 5,
      comment: "Çok faydalı bir seanstı.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a rating outside 1-5", () => {
    const result = createReviewSchema.safeParse({
      appointmentId: 1,
      rating: 6,
    });
    expect(result.success).toBe(false);
  });

  it("allows an omitted comment", () => {
    const result = createReviewSchema.safeParse({ appointmentId: 1, rating: 3 });
    expect(result.success).toBe(true);
  });
});
