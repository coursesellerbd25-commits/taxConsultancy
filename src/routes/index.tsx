import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Check, Eye, Lock, Quote, Scale, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Placeholder, pageHead } from "@/components/site/PageHeader";
import { CategoryCard, CtaBand, HowItWorks, RegistrationTimeline, SectionHeading, solutions } from "@/components/site/Sections";
import { faqGroups } from "@/content/faqs";
import { useSite } from "@/lib/site-data";
import { useCatalog } from "@/lib/catalog-data";
import heroImg from "@/assets/hero-desk.jpg";
import { VatCalculator } from "@/components/site/VatCalculator";
import { ProfessionalStatistics } from "@/components/site/ProfessionalStatistics";

export const Route = createFileRoute("/")({
  head: () => pageHead(
    "Tax Compass | Tax, VAT & Corporate Compliance Consultancy in Bangladesh",
    "Professional guidance on income tax, VAT, company registration, accounting and regulatory compliance in Bangladesh. Book a consultation.",
    "/",
  ),
  component: Home,
});

const highlights = ["Tax and VAT Consultancy", "Individual and Corporate Tax Solutions", "Business Registration Assistance", "Professional Accounting Support", "Regulatory Compliance Guidance"];
const values = [
  { icon: Eye, title: "Transparency", text: "Scope and fees are discussed clearly before work begins." },
  { icon: Users, title: "Client-focused", text: "Every engagement starts by understanding your situation." },
  { icon: Lock, title: "Confidentiality", text: "Your information is used only to serve your request." },
  { icon: Scale, title: "Professional responsibility", text: "General guidance only within verified professional scope." },
];

function Home() {
  const site = useSite();
  const catalog = useCatalog();
  const faqPreview = faqGroups.flatMap((g) => g.items.slice(0, 1));
  return (
    <>
      <section className="relative overflow-hidden bg-navy-deep text-primary-foreground">
        <div className="container-page grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow">Tax · VAT · Corporate Compliance</p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] text-primary-foreground md:text-5xl lg:text-6xl">
              Your Trusted Partner for Tax, VAT &amp; Corporate Compliance in Bangladesh
            </h1>
            <p className="mt-6 max-w-xl text-lg text-primary-foreground/75">
              Navigate taxation, VAT, business registration, accounting, and regulatory compliance with professional guidance tailored to your needs.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-gold text-navy-deep hover:bg-gold-soft"><Link to="/consultation">Book a Consultation</Link></Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><Link to="/services">Explore Our Services</Link></Button>
            </div>
          </div>
          <div className="relative">
            <img src={heroImg} alt="Organized financial documents, a pen and a calculator on a consultant's desk" width={1280} height={1024} className="aspect-[4/3] w-full rounded-md object-cover" />
            <div className="absolute -bottom-5 left-5 hidden border-l-4 border-gold bg-background px-5 py-4 text-foreground shadow-lg sm:block">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Serving</p>
              <p className="font-serif text-lg text-primary">Individuals · Businesses · Investors</p>
            </div>
          </div>
        </div>
      </section>

      <ProfessionalStatistics />

      <section className="border-b bg-surface">
        <ul className="container-page grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-5">
          {highlights.map((h) => <li key={h} className="flex items-start gap-2 text-sm font-medium text-primary"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />{h}</li>)}
        </ul>
      </section>

      <VatCalculator />

      <section className="container-page grid gap-12 py-20 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow={`About ${site.businessName}`} title="Professional guidance, communicated clearly" />
          <p className="mt-5 text-muted-foreground">{site.biography ?? "Tax Compass helps individuals, businesses and foreign investors understand and meet their tax, VAT and corporate compliance obligations in Bangladesh — with practical, transparent and confidential support."}</p>
          <p className="mt-4 text-muted-foreground"><strong className="text-primary">Mission:</strong> make compliance understandable and manageable. <strong className="text-primary">Vision:</strong> a trusted, accessible compliance partner for every client we serve.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {site.credentials.length ? site.credentials.map((c) => <span key={c} className="rounded-sm border px-3 py-1 text-sm">{c}</span>) : <Placeholder>[Placeholder: verified qualifications and experience]</Placeholder>}
          </div>
          <Button asChild variant="outline" className="mt-8"><Link to="/about">Learn More About Us <ArrowRight /></Link></Button>
        </div>
        <div className="grid gap-px self-start border bg-border sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="bg-card p-6">
              <v.icon className="h-6 w-6 text-gold" aria-hidden />
              <h3 className="mt-3 font-sans text-base font-semibold text-primary">{v.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y bg-surface py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Our services" title="Professional services across eight practice areas" />
            <Link to="/services" className="text-sm font-medium text-primary hover:underline">View all services →</Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {catalog.map((c) => <CategoryCard key={c.slug} c={c} />)}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeading eyebrow="Business solutions" title="Solutions for every stage of business" />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {solutions.map((s) => (
            <article key={s.slug} className="flex flex-col border-t-4 border-gold bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <ul className="mt-4 flex-1 space-y-1.5 text-sm text-muted-foreground">{s.items.slice(0, 4).map((i) => <li key={i}>· {i}</li>)}</ul>
              <Link to="/business-solutions" hash={s.slug} className="mt-5 text-sm font-medium text-primary hover:underline">Explore solution →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y bg-surface py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Company registration" title="Your company registration journey" />
            <Link to="/company-registration" className="text-sm font-medium text-primary hover:underline">See the full process →</Link>
          </div>
          <RegistrationTimeline />
        </div>
      </section>

      <HowItWorks />

      <section className="border-t bg-surface py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Client feedback" title="What clients say" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <figure key={n} className="border bg-card p-6">
                <Quote className="h-6 w-6 text-gold" aria-hidden />
                <blockquote className="mt-3 text-sm text-muted-foreground"><Placeholder>[Placeholder: client feedback, shared with permission]</Placeholder></blockquote>
                <figcaption className="mt-4 text-sm font-medium text-primary">[Client name] · [Service received]</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-10 py-20 lg:grid-cols-3">
        <div>
          <SectionHeading eyebrow="Resources" title="Knowledge Center" />
          <p className="mt-4 text-sm text-muted-foreground">Guides on income tax, VAT, company registration and compliance.</p>
          <div className="mt-6 flex items-start gap-3 border border-dashed bg-card p-5">
            <BookOpen className="h-5 w-5 shrink-0 text-gold" aria-hidden />
            <p className="text-sm text-muted-foreground">Reviewed articles will appear here once published. <Link to="/resources" className="text-primary underline">Browse categories</Link></p>
          </div>
        </div>
        <div className="lg:col-span-2">
          <SectionHeading eyebrow="FAQs" title="Common questions" />
          <Accordion type="single" collapsible className="mt-4">
            {faqPreview.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Link to="/faqs" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">See all FAQs →</Link>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
