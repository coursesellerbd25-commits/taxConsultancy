import { categories, type Category } from "@/content/catalog";
import { services as originalServices } from "@/content/site";
import { useServices } from "@/lib/site-data";

/** Catalogue merged with owner edits: originally-listed services the owner hid are removed. */
export function useCatalog(): Category[] {
  const enabled = useServices();
  const bySlug = new Map(enabled.map((s) => [s.slug, s]));
  const managed = new Set(originalServices.map((s) => s.slug));
  return categories.map((c) => ({
    ...c,
    services: c.services
      .filter((s) => !managed.has(s.slug) || bySlug.has(s.slug))
      .map((s) => { const db = bySlug.get(s.slug); return db ? { ...s, title: db.title, short: db.short } : s; }),
  }));
}

export function useServiceDetail(slug: string) {
  const enabled = useServices();
  return enabled.find((s) => s.slug === slug);
}
