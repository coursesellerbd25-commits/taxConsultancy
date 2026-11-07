import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, FileText, Landmark } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/components/site/PageHeader";
import { AvailabilityBadge, ServiceCard } from "@/components/site/Sections";
import { InquiryForm } from "@/components/site/InquiryForm";
import { findCategory } from "@/content/catalog";
import { useCatalog, useServiceDetail } from "@/lib/catalog-data";

export const Route = createFileRoute("/services/$category/$slug")({
  loader: ({ params }) => {
    const c = findCategory(params.category);
    const s = c?.services.find((x) => x.slug === params.slug);
    if (!c || !s) throw notFound();
    return { category: c.slug, slug: s.slug, title: s.title, short: s.short, categoryTitle: c.title };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Service not found" }, { name: "robots", content: "noindex" }] };
    const h = pageHead(`${loaderData.title} in Bangladesh | Tax Compass`, `${loaderData.short} Request a consultation with Tax Compass.`, `/services/${loaderData.category}/${loaderData.slug}`);
    return { ...h, scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "Service", name: loaderData.title, description: loaderData.short, serviceType: loaderData.categoryTitle, areaServed: "Bangladesh", provider: { "@type": "Organization", name: "Tax Compass" } }) }] };
  },
  component: ServicePage,
});

function List({ items, icon: Icon = CheckCircle2 }: { items: string[]; icon?: typeof CheckCircle2 }) {
  return <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">{items.map((i) => <li key={i} className="flex gap-2 text-sm"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />{i}</li>)}</ul>;
}

function ServicePage() {
  const { category, slug } = Route.useLoaderData();
  const c = useCatalog().find((x) => x.slug === category)!;
  const s = c.services.find((x) => x.slug === slug);
  const db = useServiceDetail(slug);
  if (!s) return <div className="container-page py-20"><h1 className="text-2xl font-semibold">This service is not currently offered.</h1><Link to="/services" className="mt-4 inline-block text-primary underline">View all services</Link></div>;
  const who = db?.whoNeeds.length ? db.whoNeeds : c.whoNeeds;
  const docs = db?.documents.length ? db.documents : c.documents;
  const related = c.services.filter((x) => x.slug !== slug).slice(0, 3);
  const sections = [
    { id: "what", label: "What is this service?" }, { id: "who", label: "Who needs it" }, { id: "why", label: "Why it matters" },
    { id: "documents", label: "Documents" }, { id: "process", label: "Process" }, { id: "faqs", label: "FAQs" }, { id: "enquire", label: "Enquire" },
  ];
  return (
    <>
      <section className="border-b bg-surface">
        <div className="container-page py-12 md:py-16">
          <Breadcrumb><BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/services">Services</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/services/$category" params={{ category: c.slug }}>{c.title}</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{s.title}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList></Breadcrumb>
          <div className="mt-5"><AvailabilityBadge value={s.availability} /></div>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold md:text-5xl">{s.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{db?.description || s.short} Tax Compass provides structured guidance so you understand the requirements and can move forward with confidence.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg"><a href="#enquire">Book a Consultation</a></Button>
            <Button asChild size="lg" variant="outline"><Link to="/services/$category" params={{ category: c.slug }}>More {c.title}</Link></Button>
          </div>
        </div>
      </section>
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="On this page" className="hidden self-start lg:sticky lg:top-24 lg:block">
          <p className="eyebrow">On this page</p>
          <ul className="mt-3 space-y-2 border-l text-sm">{sections.map((x) => <li key={x.id}><a href={`#${x.id}`} className="-ml-px block border-l-2 border-transparent pl-3 text-muted-foreground hover:border-gold hover:text-primary">{x.label}</a></li>)}</ul>
        </nav>
        <div className="min-w-0 space-y-14">
          {c.note && <p className="flex gap-3 border-l-4 border-gold bg-surface p-4 text-sm"><AlertTriangle className="h-5 w-5 shrink-0 text-gold" aria-hidden />{c.note}</p>}
          <section id="what" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold">What is this service?</h2>
            <p className="mt-3 text-muted-foreground">{s.short} It forms part of our {c.title.toLowerCase()} practice area. The exact scope is agreed after an initial consultation based on your circumstances.</p>
            {db?.helpWith.length ? <List items={db.helpWith} /> : null}
          </section>
          <section id="who" className="scroll-mt-24"><h2 className="text-2xl font-semibold">Who needs this service?</h2><List items={who} /></section>
          <section id="why" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold">Why is this service important?</h2>
            <p className="mt-3 text-muted-foreground">{c.why}</p>
            <h3 className="mt-8 text-xl font-semibold">Key benefits</h3>
            <List items={c.benefits} />
          </section>
          <section id="documents" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold">Documents that may be required</h2>
            <List items={docs} icon={FileText} />
            <p className="mt-4 text-sm text-muted-foreground">A tailored checklist is shared after consultation. Please do not send documents through the public form.</p>
          </section>
          <section id="process" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold">Step-by-step process</h2>
            <ol className="mt-6 space-y-4">{c.process.map((p, i) => <li key={p} className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-gold font-serif text-sm text-primary">{i + 1}</span><span className="pt-1">{p}</span></li>)}</ol>
          </section>
          <section className="border bg-card p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold"><Landmark className="h-5 w-5 text-gold" aria-hidden /> Regulatory authority</h2>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">{c.authority.map((a) => <li key={a}>{a}</li>)}</ul>
            <p className="mt-4 text-sm text-muted-foreground">Laws, rates and procedures may change. The applicable financial year and current legislation must be verified before acting.</p>
          </section>
          <section id="faqs" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
            <Accordion type="single" collapsible className="mt-4">
              {[...c.faqs, { q: "How do I get started?", a: "Submit the enquiry form below. You will be contacted to discuss your requirements, scope and fees." }].map((f) => (
                <AccordionItem key={f.q} value={f.q}><AccordionTrigger className="text-left">{f.q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{f.a}</AccordionContent></AccordionItem>
              ))}
            </Accordion>
          </section>
          {related.length > 0 && (
            <section><h2 className="text-2xl font-semibold">Related services</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{related.map((r) => <ServiceCard key={r.slug} s={r} category={c} />)}</div></section>
          )}
          <section id="enquire" className="scroll-mt-24 border bg-card p-6 md:p-8"><InquiryForm defaultService={s.slug} title={`Enquire about ${s.title}`} /></section>
        </div>
      </div>
    </>
  );
}
