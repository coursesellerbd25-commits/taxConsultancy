import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder, pageHead } from "@/components/site/PageHeader";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead("Privacy Policy | Tax & VAT Consultancy Bangladesh", "How inquiry information is collected, stored, and used on this website.", "/privacy"),
  component: Privacy,
});

function Privacy() {
  return (
    <>
      <PageHeader
  eyebrow="Legal"
  title={policy.title}
/>

<div className="container-page max-w-3xl space-y-8 py-14">
  <p>{policy.intro}</p>

  {policy.sections.map((section) => (
    <section key={section.heading} className="space-y-3">
      <h2 className="text-xl font-semibold text-foreground">
        {section.heading}
      </h2>

      <p className="text-muted-foreground leading-7">
        {section.content}
      </p>
    </section>
  ))}
</div>
    </>
  );
}
