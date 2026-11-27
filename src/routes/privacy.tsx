
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, pageHead } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";

type PolicySection = {
  id?: string;
  heading: string;
  content: string;
};

type PrivacyPolicy = {
  title: string;
  intro: string;
  sections: PolicySection[];
};

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead(
      "Privacy Policy | Tax & VAT Consultancy Bangladesh",
      "How inquiry information is collected, stored, and used on this website.",
      "/privacy",
    ),

  loader: async (): Promise<PrivacyPolicy | null> => {
    const { data, error } = await supabase
      .from("legal_pages")
      .select("title, intro, sections")
      .eq("slug", "privacy")
      .eq("is_published", true)
      .maybeSingle();

    if (error) throw error;

    if (!data) return null;

    return {
      title: data.title || "Privacy Policy",
      intro: data.intro || "",
      sections: Array.isArray(data.sections)
        ? (data.sections as PolicySection[])
        : [],
    };
  },

  component: Privacy,
});

function Privacy() {
  const policy = Route.useLoaderData();

  if (!policy) {
    return (
      <>
        <PageHeader eyebrow="Legal" title="Privacy Policy" />
        <div className="container-page max-w-3xl py-14">
          <p className="text-muted-foreground">
            The Privacy Policy is currently unavailable.
            Please check back later.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Page Header with Introduction */}
      <PageHeader eyebrow="Legal" title={policy.title}>
        {policy.intro && <p>{policy.intro}</p>}
      </PageHeader>

      {/* Policy Sections */}
      <div className="container-page max-w-3xl space-y-8 py-14">
        {policy.sections.map((section, index) => (
          <section
            key={section.id || `${section.heading}-${index}`}
            className="space-y-3"
          >
            <h2 className="text-xl font-semibold text-foreground">
              {section.heading}
            </h2>

            <p className="whitespace-pre-wrap text-muted-foreground leading-7">
              {section.content}
            </p>
          </section>
        ))}
      </div>
    </>
  );
}
