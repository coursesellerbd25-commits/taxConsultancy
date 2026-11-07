import { Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, ClipboardCheck, FileUp, Handshake, ListChecks, MessageSquare, Search, Send } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "./CategoryIcon";
import { availabilityLabel, type Availability, type Category, type CatalogService } from "@/content/catalog";

export function SectionHeading({ eyebrow, title, children, center }: { eyebrow: string; title: string; children?: ReactNode; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{title}</h2>
      {children && <p className="mt-3 text-muted-foreground">{children}</p>}
    </div>
  );
}

export function AvailabilityBadge({ value }: { value: Availability }) {
  return <Badge variant={value === "available" ? "default" : "outline"} className="rounded-sm font-normal">{availabilityLabel[value]}</Badge>;
}

export function CategoryCard({ c }: { c: Category }) {
  return (
    <article className="group flex flex-col border bg-card p-6 transition-colors hover:border-gold">
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-primary text-gold"><CategoryIcon icon={c.icon} className="h-5 w-5" /></span>
        <span className="font-serif text-sm text-muted-foreground">{c.services.length} services</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold">{c.title}</h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.summary}</p>
      <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium">
        <Link to="/services/$category" params={{ category: c.slug }} className="inline-flex items-center gap-1 text-primary hover:underline">Learn more <span className="sr-only">about {c.title}</span><ArrowRight className="h-4 w-4" /></Link>
      </div>
    </article>
  );
}

export function ServiceCard({ s, category }: { s: CatalogService; category: Category }) {
  return (
    <article className="flex flex-col border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <CategoryIcon icon={category.icon} className="h-5 w-5 shrink-0 text-gold" />
        <AvailabilityBadge value={s.availability} />
      </div>
      <h3 className="mt-4 font-sans text-base font-semibold text-primary">{s.title}</h3>
      <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{s.short}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline"><Link to="/services/$category/$slug" params={{ category: category.slug, slug: s.slug }}>Learn more<span className="sr-only"> about {s.title}</span></Link></Button>
        <Button asChild size="sm"><Link to="/consultation" search={{ service: s.slug }}>Request consultation</Link></Button>
      </div>
    </article>
  );
}

const journey = [
  { icon: Search, title: "Choose your service" },
  { icon: Send, title: "Submit an enquiry" },
  { icon: MessageSquare, title: "Receive initial consultation" },
  { icon: Handshake, title: "Discuss requirements and fees" },
  { icon: FileUp, title: "Submit required documents" },
  { icon: Briefcase, title: "Receive professional assistance" },
  { icon: ListChecks, title: "Track progress and updates" },
];

export function HowItWorks() {
  return (
    <section className="container-page py-20">
      <SectionHeading eyebrow="How it works" title="A clear path from enquiry to completion" />
      <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-7 lg:gap-3">
        {journey.map((j, i) => (
          <li key={j.title} className="relative flex gap-4 lg:flex-col lg:gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-background text-primary"><j.icon className="h-5 w-5" aria-hidden /></span>
            <div>
              <span className="font-serif text-sm text-gold">Step {i + 1}</span>
              <p className="mt-0.5 font-medium text-primary">{j.title}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-10 max-w-3xl text-sm text-muted-foreground">Submitting an enquiry does not create a professional-client relationship. Engagement and fees are agreed before any work begins.</p>
    </section>
  );
}

export const registrationSteps = [
  { title: "Initial consultation", text: "Understand the proposed business structure and requirements." },
  { title: "Company name search", text: "Check proposed name availability and relevant requirements." },
  { title: "Document preparation", text: "Prepare the required company information and incorporation documents." },
  { title: "Application and submission", text: "Assist with the relevant RJSC submission process." },
  { title: "Registration and documentation", text: "Assist with obtaining the relevant incorporation documents." },
  { title: "Post-registration compliance", text: "Explain TIN, trade license, BIN, bank account and other requirements." },
];

export function RegistrationTimeline() {
  return (
    <div>
      <ol className="relative mt-10 grid gap-8 md:grid-cols-3 lg:grid-cols-6">
        {registrationSteps.map((s, i) => (
          <li key={s.title} className="border-t-2 border-gold pt-4">
            <span className="font-serif text-3xl text-gold">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-2 font-sans text-base font-semibold text-primary">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ol>
      <p className="mt-8 flex gap-2 text-sm text-muted-foreground"><ClipboardCheck className="h-5 w-5 shrink-0 text-gold" aria-hidden />Registration and approval timelines depend on the relevant authorities and are not guaranteed.</p>
    </div>
  );
}

export const solutions = [
  { slug: "startup", title: "Startup Business Solutions", items: ["Business structure guidance", "Company registration assistance", "TIN and BIN registration", "Trade license", "Accounting setup", "Tax compliance guidance", "Business documentation"], category: "business-registration" },
  { slug: "small-business", title: "Small Business Solutions", items: ["Bookkeeping", "VAT compliance", "Tax return preparation", "Payroll support", "Financial statements", "Accounting consultancy"], category: "accounting" },
  { slug: "corporate", title: "Corporate Solutions", items: ["Corporate tax", "VAT compliance", "Audit preparation", "Corporate documentation", "RJSC filing assistance", "Ongoing compliance support"], category: "regulatory-licenses" },
  { slug: "foreign-investor", title: "Foreign Investor Solutions", items: ["Foreign company formation", "FDI guidance", "BIDA-related assistance", "Work permit guidance", "Local tax and VAT compliance"], category: "foreign-investment" },
];

export function CtaBand({ title = "Need clarity on your tax or compliance requirements?", text = "Tell us what you need help with and request a consultation." }: { title?: string; text?: string }) {
  return (
    <section className="bg-primary py-16 text-primary-foreground">
      <div className="container-page flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-semibold text-primary-foreground">{title}</h2>
          <p className="mt-2 text-primary-foreground/75">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="bg-gold text-navy-deep hover:bg-gold-soft"><Link to="/consultation">Book a Consultation</Link></Button>
          <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><Link to="/contact">Contact Us</Link></Button>
        </div>
      </div>
    </section>
  );
}
