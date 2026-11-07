import { describe, expect, it } from "vitest";
import { calculateVat } from "@/lib/vat-calculator";

describe("VAT arithmetic with a user-supplied rate", () => {
  it("adds VAT to an exclusive amount", () => {
    const result = calculateVat(1000, 15, "exclusive");
    expect(result.net).toBe(1000);
    expect(result.vat).toBeCloseTo(150);
    expect(result.total).toBeCloseTo(1150);
  });
  it("extracts VAT from an inclusive total", () => {
    const result = calculateVat(1150, 15, "inclusive");
    expect(result.net).toBeCloseTo(1000);
    expect(result.vat).toBeCloseTo(150);
    expect(result.total).toBe(1150);
  });
  it("supports zero and decimal rates", () => {
    expect(calculateVat(1000, 0, "exclusive").vat).toBe(0);
    expect(calculateVat(1000, 7.5, "exclusive").vat).toBeCloseTo(75);
  });
  it("rejects negative, non-finite and out-of-range input", () => {
    const invalidInputs: [number, number][] = [[-1, 15], [1000, -1], [1000, 101], [NaN, 15], [Infinity, 15], [1000, NaN]];
    for (const [amount, rate] of invalidInputs) {
      expect(() => calculateVat(amount, rate, "exclusive")).toThrow();
    }
  });
});