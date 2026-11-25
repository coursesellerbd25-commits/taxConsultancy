
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { PageHeader, pageHead } from "@/components/site/PageHeader";
import { CtaBand } from "@/components/site/Sections";
import { supabase } from "@/integrations/supabase/client";

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
};

type FaqGroup = {
  category: string;
  items: FAQ[];
};

const fetchPublicFAQs = async (): Promise<FAQ[]> => {
  const { data, error } = await supabase
    .from("faqs")
    .select("id, question, answer, category, display_order")
    .eq("enabled", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const Route = createFileRoute("/faqs")({
  head: () =>
    pageHead(
      "FAQs on Income Tax, VAT, Company Registration & Training | Corporate Tax Bangladesh",
      "Answers to common questions about income tax, corporate tax, VAT, BIN, RJSC company registration, foreign investment and training in Bangladesh.",
      "/faqs"
    ),

  component: Faqs,
});

function Faqs() {
  const [q, setQ] = useState("");

  const {
    data: faqs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public-faqs"],
    queryFn: fetchPublicFAQs,
  });

  const groups = useMemo<FaqGroup[]>(() => {
    const searchTerm = q.trim().toLowerCase();

    const filteredFAQs = faqs.filter((faq) => {
      if (!searchTerm) return true;

      return (
        faq.question.toLowerCase().includes(searchTerm) ||
        faq.answer.toLowerCase().includes(searchTerm) ||
        faq.category.toLowerCase().includes(searchTerm)
      );
    });

    const groupedFAQs = new Map<string, FAQ[]>();

    filteredFAQs.forEach((faq) => {
      const category = faq.category || "General";

      if (!groupedFAQs.has(category)) {
        groupedFAQs.set(category, []);
      }

      groupedFAQs.get(category)!.push(faq);
    });

    return Array.from(groupedFAQs.entries()).map(
      ([category, items]) => ({
        category,
        items,
      })
    );
  }, [faqs, q]);

  return (
    <>
      <PageHeader
        eyebrow="FAQs"
        title="Frequently asked questions"
      >
        General answers only. Rules can change, so verify requirements for the current financial year.
      </PageHeader>

      <div className="container-page max-w-3xl py-14">
        {/* Search */}
        <label htmlFor="faq-search" className="sr-only">
          Search FAQs
        </label>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <Input
            id="faq-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search questions…"
            className="h-11 pl-9"
          />
        </div>

        {/* Loading state */}
        {isLoading && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Loading FAQs...
          </p>
        )}

        {/* Error state */}
        {isError && (
          <div className="mt-8 rounded-lg border border-destructive/20 bg-destructive/5 px-5 py-8 text-center">
            <h2 className="font-semibold">
              Unable to load FAQs
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Please refresh the page or try again later.
            </p>
          </div>
        )}

        {/* FAQ categories */}
        {!isLoading && !isError && groups.length > 0 && (
          <>
            {groups.map((g) => (
              <section key={g.category} className="mt-10">
                <h2 className="text-xl font-semibold">
                  {g.category} FAQs
                </h2>

                <Accordion type="multiple">
                  {g.items.map((f) => (
                    <AccordionItem
                      key={f.id}
                      value={f.id}
                    >
                      <AccordionTrigger className="text-left">
                        {f.question}
                      </AccordionTrigger>

                      <AccordionContent className="text-muted-foreground">
                        {f.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </>
        )}

        {/* Empty state */}
        {!isLoading && !isError && groups.length === 0 && (
          <p className="mt-8 text-center text-muted-foreground">
            {q.trim()
              ? "No questions match your search."
              : "There are no published FAQs available at the moment."}
          </p>
        )}
      </div>

      <CtaBand title="Still have a question?" />
    </>
  );
}
