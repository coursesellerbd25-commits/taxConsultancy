import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder, pageHead } from "@/components/site/PageHeader";

export const Route = createFileRoute("/terms")({
  head: () => pageHead("Terms of Use | Tax & VAT Consultancy Bangladesh", "Terms governing use of this website and its general educational content.", "/terms"),
  component: Terms,
});

function Terms() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms of Use" />
      <div className="container-page max-w-3xl space-y-6 py-14 text-muted-foreground">
        <Placeholder>Draft — to be reviewed by a qualified professional before launch.</Placeholder>
        <h2 className="text-xl font-semibold">General information only</h2>
        <p>Content on this website is general and educational. It is not individualized tax or legal advice, and tax rules may change. Always verify current requirements with the National Board of Revenue.</p>
        <h2 className="text-xl font-semibold">No guarantee of service</h2>
        <p>Submitting a consultation request does not create a professional-client relationship and does not guarantee that a service will be provided.</p>
        <h2 className="text-xl font-semibold">No guaranteed outcomes</h2>
        <p>No specific tax outcome, saving, refund, or approval is promised.</p>
      </div>
    </>
  );
}
