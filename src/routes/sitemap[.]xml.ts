import { createFileRoute } from "@tanstack/react-router";
import { allServices, categories, courses } from "@/content/catalog";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const paths = ["/", "/about", "/services", "/business-solutions", "/company-registration", "/training", "/resources", "/faqs", "/contact", "/consultation", "/privacy", "/terms", "/disclaimer",
          ...categories.map((c) => `/services/${c.slug}`),
          ...allServices.map((s) => `/services/${s.category.slug}/${s.slug}`),
          ...courses.map((c) => `/training/${c.slug}`)];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((p) => `<url><loc>${origin}${p}</loc></url>`).join("")}</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
