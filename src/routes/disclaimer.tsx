import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, pageHead } from "@/components/site/PageHeader";

export const Route = createFileRoute("/disclaimer")({
  head: () => pageHead("Disclaimer | Corporate Tax Bangladesh", "Important information about the general nature of content on the Corporate Tax Bangladesh website.", "/disclaimer"),
  component: Disclaimer,
});

function Disclaimer() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Disclaimer" />
      <div className="container-page max-w-3xl space-y-4 py-14 text-muted-foreground">
        <p>Information on this website is general and educational. It is not individualized tax, legal or financial advice.</p>
        <p>Tax rates, thresholds, deadlines and procedures in Bangladesh may change through the Finance Act, NBR orders and other regulations. Verify the rules for the applicable financial year before acting.</p>
        <p>Corporate Tax Bangladesh is not a law firm. Services involving litigation, intellectual property or immigration are limited to consultancy and documentation support; legal representation is provided only by licensed practitioners.</p>
        <p>Submitting an enquiry does not create a professional-client relationship. Timelines for registrations and approvals depend on the relevant authorities and are not guaranteed.</p>
      </div>
    </>
  );
}
