import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, pageHead } from "@/components/site/PageHeader";
import { CategoryIcon } from "@/components/site/CategoryIcon";
import { CtaBand, ServiceCard } from "@/components/site/Sections";
import { useCatalog } from "@/lib/catalog-data";

export const Route = createFileRoute("/services/")({
  head: () => pageHead("Services | Tax, VAT, Company Registration & Accounting in Bangladesh", "Explore income tax, VAT, business registration, accounting, IP, foreign investment and corporate compliance services in Bangladesh.", "/services"),
  component: Services,
});

function Services() {
  const catalog = useCatalog();
  return (
    <>
      <PageHeader eyebrow="Services" title="Professional services for individuals and businesses">
        Browse eight practice areas. Services marked "Contact for availability" are confirmed during consultation.
      </PageHeader>
      <nav aria-label="Service categories" className="sticky top-16 z-20 border-b bg-background/95 backdrop-blur">
        <ul className="container-page flex gap-1 overflow-x-auto py-2 text-sm">
          {catalog.map((c) => <li key={c.slug}><a href={`#${c.slug}`} className="block whitespace-nowrap rounded-sm px-3 py-1.5 hover:bg-accent">{c.letter}. {c.title}</a></li>)}
        </ul>
      </nav>
      <div className="container-page space-y-16 py-14">
        {catalog.map((c) => (
          <section key={c.slug} id={c.slug} className="scroll-mt-32">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-gold"><CategoryIcon icon={c.icon} className="h-5 w-5" /></span>
                <h2 className="text-2xl font-semibold">{c.title}</h2>
              </div>
              <Link to="/services/$category" params={{ category: c.slug }} className="text-sm font-medium text-primary hover:underline">Category overview →</Link>
            </div>
            {c.note && <p className="mt-3 text-sm text-muted-foreground">{c.note}</p>}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {c.services.map((s) => <ServiceCard key={s.slug} s={s} category={c} />)}
            </div>
          </section>
        ))}
      </div>
      <CtaBand />
    </>
  );
}
