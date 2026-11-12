import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, pageHead } from "@/components/site/PageHeader";
import { CtaBand, solutions } from "@/components/site/Sections";

export const Route = createFileRoute("/business-solutions")({
  head: () => pageHead("Business Solutions for Startups, SMEs, Companies & Investors | Corporate Tax Bangladesh", "Packaged tax, VAT, registration and accounting support for startups, small businesses, corporates and foreign investors in Bangladesh.", "/business-solutions"),
  component: Solutions,
});

function Solutions() {
  return (
    <>
      <PageHeader eyebrow="Business Solutions" title="Support for every stage of your business">Whether you are starting out, growing, or entering Bangladesh as a foreign investor.</PageHeader>
      <div className="container-page grid gap-6 py-14 md:grid-cols-2">
        {solutions.map((s) => (
          <section key={s.slug} id={s.slug} className="flex scroll-mt-24 flex-col border-t-4 border-gold bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">{s.title}</h2>
            <ul className="mt-5 flex-1 space-y-2.5">{s.items.map((i) => <li key={i} className="flex gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />{i}</li>)}</ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild><Link to="/consultation">Request consultation</Link></Button>
              <Button asChild variant="outline"><Link to="/services/$category" params={{ category: s.category }}>Related services</Link></Button>
            </div>
          </section>
        ))}
      </div>
      <CtaBand />
    </>
  );
}
