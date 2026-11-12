import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader, pageHead } from "@/components/site/PageHeader";
import { InquiryForm } from "@/components/site/InquiryForm";

export const Route = createFileRoute("/consultation")({
  validateSearch: z.object({ service: z.string().max(100).optional() }),
  head: () => pageHead("Book a Consultation | Corporate Tax Bangladesh Bangladesh", "Submit an enquiry for tax, VAT, company registration, accounting or compliance assistance in Bangladesh.", "/consultation"),
  component: Consultation,
});

function Consultation() {
  const { service } = Route.useSearch();
  return (
    <>
      <PageHeader eyebrow="Consultation" title="Book a consultation">
        Tell us what you need help with. A request does not create a professional-client relationship or guarantee a service.
      </PageHeader>
      <div className="container-page max-w-3xl py-14">
        <InquiryForm key={service ?? ""} defaultService={service ?? ""} />
      </div>
    </>
  );
}
