import { describe, expect, it } from "vitest";
import { calculateDiscount } from "./service";

describe("calculateDiscount", () => {
  it("applies percentage discounts", () => {
    expect(calculateDiscount(1000, { kind: "yuzde", value: 20 })).toEqual({
      discountAmountTl: 200,
      finalAmountTl: 800,
    });
  });

  it("applies fixed-amount discounts", () => {
    expect(calculateDiscount(500, { kind: "tutar", value: 150 })).toEqual({
      discountAmountTl: 150,
      finalAmountTl: 350,
    });
  });

  it("never charges 0 TL — leaves at least 1 TL payable", () => {
    expect(calculateDiscount(100, { kind: "tutar", value: 500 })).toEqual({
      discountAmountTl: 99,
      finalAmountTl: 1,
    });
    expect(calculateDiscount(100, { kind: "yuzde", value: 100 })).toEqual({
      discountAmountTl: 99,
      finalAmountTl: 1,
    });
  });
});
