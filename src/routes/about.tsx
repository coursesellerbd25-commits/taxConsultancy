
import { createFileRoute, Link } from "@tanstack/react-router";
import { UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  Placeholder,
  pageHead,
} from "@/components/site/PageHeader";
import { useServices } from "@/lib/site-data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead(
      "About Us | Corporate Tax Bangladesh",
      "Professional profile, qualifications, and approach of a Bangladesh-based tax practitioner and VAT consultant.",
      "/about",
    ),
  component: About,
});

type AboutPageContent = {
  consultant_name: string | null;
  about_eyebrow: string | null;
  about_intro: string | null;
  consultant_photo_url: string | null;
  biography: string | null;
  credentials: string[] | null;
  professional_experience: string | null;
  specializations: string[] | null;
  professional_approach: string | null;
  affiliations: string[] | null;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b py-8 last:border-0">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 text-muted-foreground">{children}</div>
    </section>
  );
}

function About() {
  const services = useServices();

  const aboutQuery = useQuery({
    queryKey: ["public-about-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select(
          "consultant_name, about_eyebrow, about_intro, consultant_photo_url, biography, credentials, professional_experience, specializations, professional_approach, affiliations",
        )
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;

      return data as AboutPageContent | null;
    },
  });

  const content = aboutQuery.data;

  const specializations =
    content?.specializations?.length
      ? content.specializations
      : services.map((service) => service.title);

  return (
    <>
      <PageHeader
        eyebrow={content?.about_eyebrow || "About"}
        title={content?.consultant_name || "About the Consultant"}
      >
        {content?.about_intro ||
          "A tax practitioner and VAT consultant serving individuals and businesses in Bangladesh."}
      </PageHeader>

      <div className="container-page grid gap-12 py-14 md:grid-cols-3">
        <aside>
          <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-md border bg-surface">
            {content?.consultant_photo_url ? (
              <img
                src={content.consultant_photo_url}
                alt={content.consultant_name || "Professional consultant"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-center">
                <UserRound
                  className="mx-auto h-12 w-12 text-muted-foreground"
                  aria-hidden
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  Professional photograph
                </p>
                <Placeholder>[To be provided]</Placeholder>
              </div>
            )}
          </div>
        </aside>

        <div className="md:col-span-2">
          <Section title="Professional biography">
            {content?.biography || (
              <Placeholder>
                [Professional biography to be added by the owner]
              </Placeholder>
            )}
          </Section>

          <Section title="Qualifications and certifications">
            {content?.credentials?.length ? (
              <ul className="list-disc space-y-1 pl-5">
                {content.credentials.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <Placeholder>
                [Verified qualifications will be listed here]
              </Placeholder>
            )}
          </Section>

          <Section title="Professional experience">
            {content?.professional_experience || (
              <Placeholder>
                [Relevant professional experience to be added]
              </Placeholder>
            )}
          </Section>

          <Section title="Areas of specialization">
            {specializations.length ? (
              <ul className="grid gap-1 sm:grid-cols-2">
                {specializations.map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
            ) : (
              <Placeholder>
                [Areas of specialization will appear here]
              </Placeholder>
            )}
          </Section>

          <Section title="Professional approach">
            {content?.professional_approach || (
              <Placeholder>
                [Professional approach to be added by the owner]
              </Placeholder>
            )}
          </Section>

          <Section title="Professional affiliations">
            {content?.affiliations?.length ? (
              <ul className="list-disc space-y-1 pl-5">
                {content.affiliations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <Placeholder>
                [Verified professional affiliations, if applicable]
              </Placeholder>
            )}
          </Section>

          <Button asChild size="lg" className="mt-6">
            <Link to="/consultation">Request a Consultation</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
