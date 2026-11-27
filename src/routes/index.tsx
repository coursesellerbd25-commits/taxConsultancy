
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Check,
  Eye,
  Lock,
  Quote,
  Scale,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Placeholder, pageHead } from "@/components/site/PageHeader";
import {
  CategoryCard,
  CtaBand,
  SectionHeading,
} from "@/components/site/Sections";
import { faqGroups } from "@/content/faqs";
import { useSite } from "@/lib/site-data";
import { useCatalog } from "@/lib/catalog-data";
import heroImg from "@/assets/hero-desk.jpg";
import { VatCalculator } from "@/components/site/VatCalculator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  defaultHomepageContent,
  normalizeHomepageContent,
} from "@/lib/homepage-content";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Corporate Tax Bangladesh | Tax, VAT & Corporate Compliance Consultancy in Bangladesh",
      "Professional guidance on income tax, VAT, company registration, accounting and regulatory compliance in Bangladesh. Book a consultation.",
      "/",
    ),
  component: Home,
});

const valueIcons = [Eye, Users, Lock, Scale];

const defaultHighlights = [
  "Tax and VAT Consultancy",
  "Individual and Corporate Tax Solutions",
  "Business Registration Assistance",
  "Professional Accounting Support",
  "Regulatory Compliance Guidance",
];

type BusinessSolution = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  who_needs: string[] | null;
  help_with: string[] | null;
  documents: string[] | null;
  display_order: number | null;
  enabled: boolean;
};

function Home() {
  const site = useSite();
  const catalog = useCatalog();

  // Homepage content managed through the admin dashboard.
  const homepageQuery = useQuery({
    queryKey: ["homepage-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_content")
        .select("content")
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;

      return normalizeHomepageContent(data?.content ?? {});
    },
  });

  // Business Solutions managed separately from Services.
  const businessSolutionsQuery = useQuery({
    queryKey: ["business-solutions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_solutions")
        .select(
          "id, title, slug, short_description, full_description, who_needs, help_with, documents, display_order, enabled",
        )
        .eq("enabled", true)
        .order("display_order", { ascending: true });

      if (error) throw error;

      return (data ?? []) as BusinessSolution[];
    },
  });

  const content = homepageQuery.data ?? defaultHomepageContent;
  const about = content.about;
  const registration = content.registration;
  const howItWorks = content.how_it_works;
  const testimonials = content.testimonials;

  const faqPreview = faqGroups.flatMap((group) =>
    group.items.slice(0, 1),
  );

  const highlights = defaultHighlights;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-deep text-primary-foreground">
        <div className="container-page grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow">{content.hero.eyebrow}</p>

            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] text-primary-foreground md:text-5xl lg:text-6xl">
              {content.hero.title}
            </h1>

            <p className="mt-6 max-w-xl text-lg text-primary-foreground/75">
              {content.hero.description}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-gold text-navy-deep hover:bg-gold-soft"
              >
                <Link to="/consultation">
                  {content.hero.primary_button}
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link to="/services">
                  {content.hero.secondary_button}
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <img
              src={content.hero.image_url || heroImg}
              alt="Organized financial documents, a pen and a calculator on a consultant's desk"
              width={1280}
              height={1024}
              className="aspect-[4/3] w-full rounded-md object-cover"
            />

            <div className="absolute -bottom-5 left-5 hidden border-l-4 border-gold bg-background px-5 py-4 text-foreground shadow-lg sm:block">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {content.hero.serving_label}
              </p>
              <p className="font-serif text-lg text-primary">
                {content.hero.serving_text}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROFESSIONAL STATISTICS */}
      {content.statistics?.length > 0 && (
        <section className="border-b bg-background">
          <div className="container-page grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
            {content.statistics.map((stat) => (
              <div key={stat.id} className="text-center">
                <p className="font-serif text-3xl font-semibold text-primary md:text-4xl">
                  {stat.value ?? "—"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* HIGHLIGHTS */}
      <section className="border-b bg-surface">
        <ul className="container-page grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-5">
          {highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex items-start gap-2 text-sm font-medium text-primary"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                aria-hidden
              />
              {highlight}
            </li>
          ))}
        </ul>
      </section>

      {/* VAT CALCULATOR */}
      <VatCalculator />

      {/* ABOUT */}
      <section className="container-page grid gap-12 py-20 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow={about.eyebrow || `About ${site.businessName}`}
            title={about.title}
          />

          <p className="mt-5 text-muted-foreground">
            {about.description || site.biography}
          </p>

          {(about.mission || about.vision) && (
            <p className="mt-4 text-muted-foreground">
              {about.mission && (
                <>
                  <strong className="text-primary">
                    {about.mission_label || "Mission:"}
                  </strong>{" "}
                  {about.mission}{" "}
                </>
              )}

              {about.vision && (
                <>
                  <strong className="text-primary">
                    {about.vision_label || "Vision:"}
                  </strong>{" "}
                  {about.vision}
                </>
              )}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {about.credentials?.length
              ? about.credentials.map((credential) => (
                  <span
                    key={credential}
                    className="rounded-sm border px-3 py-1 text-sm"
                  >
                    {credential}
                  </span>
                ))
              : site.credentials.length
                ? site.credentials.map((credential) => (
                    <span
                      key={credential}
                      className="rounded-sm border px-3 py-1 text-sm"
                    >
                      {credential}
                    </span>
                  ))
                : (
                    <Placeholder>
                      [Placeholder: verified qualifications and experience]
                    </Placeholder>
                  )}
          </div>

          <Button asChild variant="outline" className="mt-8">
            <Link to="/about">
              {about.button_text || "Learn More About Us"}
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="grid gap-px self-start border bg-border sm:grid-cols-2">
          {(about.values ?? []).map((value, index) => {
            const ValueIcon = valueIcons[index % valueIcons.length];

            return (
              <div key={`${value.title}-${index}`} className="bg-card p-6">
                <ValueIcon
                  className="h-6 w-6 text-gold"
                  aria-hidden
                />
                <h3 className="mt-3 font-sans text-base font-semibold text-primary">
                  {value.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {value.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SERVICES */}
      <section className="border-y bg-surface py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Our services"
              title="Professional services across our practice areas"
            />

            <Link
              to="/services"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all services →
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {catalog.map((service) => (
              <CategoryCard key={service.slug} c={service} />
            ))}
          </div>

          {catalog.length === 0 && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Services will appear here once published.
            </p>
          )}
        </div>
      </section>

      {/* BUSINESS SOLUTIONS */}
      <section className="container-page py-20">
        <SectionHeading
          eyebrow="Business solutions"
          title="Solutions for every stage of business"
        />

        {businessSolutionsQuery.isLoading ? (
          <p className="mt-10 text-sm text-muted-foreground">
            Loading business solutions...
          </p>
        ) : businessSolutionsQuery.isError ? (
          <p className="mt-10 text-sm text-muted-foreground">
            Business solutions are temporarily unavailable.
          </p>
        ) : businessSolutionsQuery.data?.length ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {businessSolutionsQuery.data.map((solution) => (
              <article
                key={solution.id}
                className="flex flex-col border-t-4 border-gold bg-card p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold">
                  {solution.title}
                </h3>

                <p className="mt-3 text-sm text-muted-foreground">
                  {solution.short_description}
                </p>

                {solution.help_with?.length ? (
                  <ul className="mt-4 flex-1 space-y-1.5 text-sm text-muted-foreground">
                    {solution.help_with.slice(0, 4).map((item) => (
                      <li key={item}>· {item}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex-1" />
                )}

                <Link
                  to="/business-solutions"
                  hash={solution.slug}
                  className="mt-5 text-sm font-medium text-primary hover:underline"
                >
                  Explore solution →
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-sm text-muted-foreground">
            Business solutions will appear here once published.
          </p>
        )}
      </section>

      {/* COMPANY REGISTRATION */}
      <section className="border-y bg-surface py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow={registration.eyebrow}
              title={registration.title}
            />

            <Link
              to="/company-registration"
              className="text-sm font-medium text-primary hover:underline"
            >
              {registration.link_text || "See the full process →"}
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {registration.steps?.map((step, index) => (
              <article
                key={`${step.title}-${index}`}
                className="relative border bg-card p-6"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-deep text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>

                <h3 className="mt-5 font-semibold text-primary">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </article>
            ))}
          </div>

          {registration.disclaimer && (
            <p className="mt-6 text-sm text-muted-foreground">
              {registration.disclaimer}
            </p>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container-page py-20">
        <SectionHeading
          eyebrow={howItWorks.eyebrow}
          title={howItWorks.title}
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {howItWorks.steps?.map((step, index) => (
            <article
              key={`${step.title}-${index}`}
              className="border-l-4 border-gold bg-card p-6 shadow-sm"
            >
              <p className="text-sm font-semibold uppercase tracking-wider text-gold">
                Step {index + 1}
              </p>

              <h3 className="mt-3 font-semibold text-primary">
                {step.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.text}
              </p>
            </article>
          ))}
        </div>

        {howItWorks.disclaimer && (
          <p className="mt-6 text-sm text-muted-foreground">
            {howItWorks.disclaimer}
          </p>
        )}
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y bg-surface py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow={testimonials.eyebrow}
            title={testimonials.title}
          />

          {testimonials.items?.length ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.items.map((testimonial, index) => (
                <figure
                  key={`${testimonial.client_name}-${index}`}
                  className="border bg-card p-6"
                >
                  <Quote
                    className="h-6 w-6 text-gold"
                    aria-hidden
                  />

                  <blockquote className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {testimonial.quote}
                  </blockquote>

                  <figcaption className="mt-4 text-sm font-medium text-primary">
                    {testimonial.client_name}
                    {testimonial.service
                      ? ` · ${testimonial.service}`
                      : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">
              Client feedback will appear here once published.
            </p>
          )}
        </div>
      </section>

      {/* RESOURCES AND FAQ */}
      <section className="container-page grid gap-10 py-20 lg:grid-cols-3">
        <div>
          <SectionHeading
            eyebrow="Resources"
            title="Knowledge Center"
          />

          <p className="mt-4 text-sm text-muted-foreground">
            Guides on income tax, VAT, company registration and compliance.
          </p>

          <div className="mt-6 flex items-start gap-3 border border-dashed bg-card p-5">
            <BookOpen
              className="h-5 w-5 shrink-0 text-gold"
              aria-hidden
            />

            <p className="text-sm text-muted-foreground">
              Reviewed articles will appear here once published.{" "}
              <Link
                to="/resources"
                className="text-primary underline"
              >
                Browse categories
              </Link>
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <SectionHeading
            eyebrow="FAQs"
            title="Common questions"
          />

          <Accordion type="single" collapsible className="mt-4">
            {faqPreview.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q}>
                <AccordionTrigger className="text-left text-base">
                  {faq.q}
                </AccordionTrigger>

                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Link
            to="/faqs"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            See all FAQs →
          </Link>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <CtaBand />
    </>
  );
}
