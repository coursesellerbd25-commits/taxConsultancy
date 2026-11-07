import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Landmark } from "lucide-react";
import { PageHeader, pageHead } from "@/components/site/PageHeader";
import { CtaBand, ServiceCard } from "@/components/site/Sections";
import { findCategory } from "@/content/catalog";
import { useCatalog } from "@/lib/catalog-data";

export const Route = createFileRoute("/services/$category/")({
  loader: ({ params }) => {
    const c = findCategory(params.category);
    if (!c) throw notFound();
    return { slug: c.slug, title: c.title, summary: c.summary };
  },
  head: ({ loaderData }) => loaderData
    ? pageHead(`${loaderData.title} in Bangladesh | Tax Compass`, loaderData.summary, `/services/${loaderData.slug}`)
    : { meta: [{ title: "Service category not found" }, { name: "robots", content: "noindex" }] },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useLoaderData();
  const c = useCatalog().find((x) => x.slug === slug)!;
  return (
    <>
      <PageHeader eyebrow={`Category ${c.letter}`} title={c.title}>{c.summary}</PageHeader>
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1fr_18rem]">
        <div>
          {c.note && <p className="mb-6 border-l-4 border-gold bg-surface p-4 text-sm">{c.note}</p>}
          <div className="grid gap-4 sm:grid-cols-2">{c.services.map((s) => <ServiceCard key={s.slug} s={s} category={c} />)}</div>
        </div>
        <aside className="space-y-6 self-start lg:sticky lg:top-24">
          <div className="border bg-card p-5">
            <h2 className="flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-wider text-primary"><Landmark className="h-4 w-4 text-gold" aria-hidden /> Relevant authorities</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">{c.authority.map((a) => <li key={a}>{a}</li>)}</ul>
          </div>
          <div className="border bg-card p-5">
            <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-primary">Who this is for</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">{c.whoNeeds.map((a) => <li key={a}>{a}</li>)}</ul>
          </div>
          <Link to="/services" className="block text-sm font-medium text-primary hover:underline">← All services</Link>
        </aside>
      </div>
      <CtaBand />
    </>
  );
}
