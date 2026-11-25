
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
import { CtaBand } from "@/components/site/CtaBand";
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
      "FAQs on Income Tax, VAT, Company Registration & Training | Tax Compass",
      "Answers to common questions about income tax, corporate tax, VAT, BIN, RJSC company registration, foreign investment and training in Bangladesh.",
      "/faqs"
    ),

  component: Faqs,
});

function Faqs() {
  const [search, setSearch] = useState("");

  const {
    data: faqs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public-faqs"],
    queryFn: fetchPublicFAQs,
  });

  const filteredGroups = useMemo<FaqGroup[]>(() => {
    const query = search.trim().toLowerCase();

    const filteredFAQs = faqs.filter((faq) => {
      if (!query) return true;

      return (
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query)
      );
    });

    const groups = new Map<string, FAQ[]>();

    filteredFAQs.forEach((faq) => {
      const category = faq.category || "General";

      if (!groups.has(category)) {
        groups.set(category, []);
      }

      groups.get(category)!.push(faq);
    });

    return Array.from(groups.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  }, [faqs, search]);

  return (
    <>
      <PageHeader
        eyebrow="FAQs"
        title="Frequently asked questions"
      >
        <p className="mx-auto max-w-2xl text-muted-foreground">
          General answers only. Rules can change, so verify requirements
          for the current financial year.
        </p>
      </PageHeader>

      <section className="section-padding">
        <div className="container mx-auto max-w-4xl">
          {/* Search */}
          <div className="relative mb-10">
            <Search
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <Input
              type="search"
              placeholder="Search frequently asked questions..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-12 pl-11"
              aria-label="Search frequently asked questions"
            />
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Loading frequently asked questions...
              </p>
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center">
              <h2 className="font-semibold">
                Unable to load FAQs
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Please refresh the page or try again later.
              </p>
            </div>
          )}

          {/* FAQ categories */}
          {!isLoading && !isError && filteredGroups.length > 0 && (
            <div className="space-y-10">
              {filteredGroups.map((group) => (
                <div key={group.category}>
                  <h2 className="mb-4 text-xl font-semibold tracking-tight">
                    {group.category} FAQs
                  </h2>

                  <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                  >
                    {group.items.map((faq) => (
                      <AccordionItem
                        key={faq.id}
                        value={faq.id}
                      >
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>

                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          )}

          {/* No matching results */}
          {!isLoading &&
            !isError &&
            filteredGroups.length === 0 && (
              <div className="py-16 text-center">
                <h2 className="text-lg font-semibold">
                  No questions found
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  {search.trim()
                    ? "Try a different search term."
                    : "There are no published FAQs available at the moment."}
                </p>
              </div>
            )}
        </div>
      </section>

      <CtaBand title="Still have a question?" />
    </>
  );
}
