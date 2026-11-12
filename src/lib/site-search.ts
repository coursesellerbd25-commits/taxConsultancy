import { courses, type Category } from "@/content/catalog";

export type SearchItem = { title: string; description: string } & (
  | { kind: "service"; category: string; slug: string }
  | { kind: "category"; category: string }
  | { kind: "course"; slug: string }
  | { kind: "page"; to: "/about" | "/services" | "/business-solutions" | "/training" | "/resources" | "/faqs" | "/contact" | "/consultation" }
  | { kind: "calculator" }
);

export function searchSite(catalog: Category[], query: string): SearchItem[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const items: SearchItem[] = [
    { kind: "calculator", title: "VAT Calculator", description: "Estimate VAT and totals in BDT" },
    ...catalog.flatMap((category): SearchItem[] => [
      { kind: "category", category: category.slug, title: category.title, description: category.summary },
      ...category.services.map((s): SearchItem => ({ kind: "service", category: category.slug, slug: s.slug, title: s.title, description: s.short })),
    ]),
    ...courses.map((c): SearchItem => ({ kind: "course", slug: c.slug, title: c.title, description: c.overview })),
    { kind: "page", to: "/about", title: "About Us", description: "About Corporate Tax Bangladesh" },
    { kind: "page", to: "/services", title: "All Services", description: "Tax, VAT and corporate compliance" },
    { kind: "page", to: "/business-solutions", title: "Business Solutions", description: "Startups, small businesses, companies and investors" },
    { kind: "page", to: "/training", title: "Training & Courses", description: "Professional learning" },
    { kind: "page", to: "/resources", title: "Knowledge Center", description: "Resources and guides" },
    { kind: "page", to: "/faqs", title: "FAQs", description: "Frequently asked questions" },
    { kind: "page", to: "/contact", title: "Contact", description: "Contact Corporate Tax Bangladesh" },
    { kind: "page", to: "/consultation", title: "Book a Consultation", description: "Submit an enquiry" },
  ];
  return items.filter((item) => terms.every((term) => `${item.title} ${item.description}`.toLowerCase().includes(term)))
    .sort((a, b) => Number(b.title.toLowerCase().includes(query.trim().toLowerCase())) - Number(a.title.toLowerCase().includes(query.trim().toLowerCase())));
}