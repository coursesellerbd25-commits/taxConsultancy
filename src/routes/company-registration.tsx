import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader, pageHead } from "@/components/site/PageHeader";
import { CtaBand, RegistrationTimeline } from "@/components/site/Sections";

export const Route = createFileRoute("/company-registration")({
  head: () => pageHead("Company Registration Process in Bangladesh (RJSC) | Corporate Tax Bangladesh", "Step-by-step overview of registering a company in Bangladesh: name clearance, documents, RJSC submission and post-registration compliance.", "/company-registration"),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader eyebrow="Company Registration" title="The company registration journey">A six-step overview of forming a company with RJSC and completing post-registration requirements.</PageHeader>
      <div className="container-page py-14">
        <RegistrationTimeline />
        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild size="lg"><Link to="/consultation" search={{ service: "private-limited-company" }}>Start with a consultation</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/services/$category" params={{ category: "business-registration" }}>Registration services</Link></Button>
        </div>
      </div>
      <CtaBand />
    </>
  );
}
