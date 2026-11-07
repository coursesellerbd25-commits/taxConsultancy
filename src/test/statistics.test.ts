import { describe, expect, it } from "vitest";
import { professionalStatistics, verifiedStatisticValue } from "@/content/statistics";

describe("owner-verified professional statistics", () => {
  it("leaves all four unprovided achievements unclaimed", () => {
    expect(professionalStatistics.map(({ value }) => value)).toEqual([null, null, null, null]);
  });
  it("does not convert an unconfirmed value to zero", () => {
    expect(verifiedStatisticValue(null)).toBeNull();
  });
  it("rejects invalid achievement numbers", () => {
    for (const value of [-1, 1.5, Infinity, NaN]) {
      expect(verifiedStatisticValue(value)).toBeNull();
    }
  });
  it("preserves confirmed whole numbers including zero", () => {
    expect(verifiedStatisticValue(0)).toBe(0);
    expect(verifiedStatisticValue(25)).toBe(25);
  });
});