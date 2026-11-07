import { expect, it } from "vitest";
import { categories } from "@/content/catalog";
import { searchSite } from "@/lib/site-search";

it("finds the calculator, services and courses case-insensitively", () => {
  expect(searchSite(categories, "VAT calculator").some((x) => x.kind === "calculator")).toBe(true);
  expect(searchSite(categories, "bin registration").some((x) => x.kind === "service" && x.slug === "bin-registration")).toBe(true);
  expect(searchSite(categories, "VAT COMPLIANCE").some((x) => x.kind === "course")).toBe(true);
});
it("does not return hidden services or results for empty and unmatched input", () => {
  const filtered = categories.map((c) => ({ ...c, services: c.services.filter((s) => s.slug !== "bin-registration") }));
  expect(searchSite(filtered, "bin registration").some((x) => x.kind === "service" && x.slug === "bin-registration")).toBe(false);
  expect(searchSite(categories, " ")).toEqual([]);
  expect(searchSite(categories, "zzzznomatch")).toEqual([]);
});