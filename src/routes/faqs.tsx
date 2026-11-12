import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeader, pageHead } from "@/components/site/PageHeader";
import { CtaBand } from "@/components/site/Sections";
import { faqGroups } from "@/content/faqs";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    ...pageHead("FAQs on Income Tax, VAT, Company Registration & Training | Corporate Tax Bangladesh", "Answers to common questions about income tax, corporate tax, VAT, BIN, RJSC company registration, foreign investment and training in Bangladesh.", "/faqs"),
    scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqGroups.flatMap((g) => g.items).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }) }],
  }),
  component: Faqs,
});

function Faqs() {
  const [q, setQ] = useState("");
  const groups = useMemo(() => {
    const t = q.trim().toLowerCase();
    return faqGroups.map((g) => ({ ...g, items: g.items.filter((f) => !t || (f.q + f.a).toLowerCase().includes(t)) })).filter((g) => g.items.length);
  }, [q]);
  return (
    <>
      <PageHeader eyebrow="FAQs" title="Frequently asked questions">General answers only. Rules can change, so verify requirements for the current financial year.</PageHeader>
      <div className="container-page max-w-3xl py-14">
        <label htmlFor="faq-search" className="sr-only">Search FAQs</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input id="faq-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions…" className="h-11 pl-9" />
        </div>
        {groups.length === 0 && <p className="mt-8 text-muted-foreground">No questions match your search.</p>}
        {groups.map((g) => (
          <section key={g.category} className="mt-10">
            <h2 className="text-xl font-semibold">{g.category} FAQs</h2>
            <Accordion type="multiple">
              {g.items.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>
      <CtaBand title="Still have a question?" />
    </>
  );
}
