import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder, pageHead } from "@/components/site/PageHeader";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead("Privacy Policy | Tax & VAT Consultancy Bangladesh", "How inquiry information is collected, stored, and used on this website.", "/privacy"),
  component: Privacy,
});

function Privacy() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <div className="container-page max-w-3xl space-y-6 py-14 text-muted-foreground">
        <Placeholder>Draft — to be reviewed by a qualified professional before launch.</Placeholder>
        <h2 className="text-xl font-semibold">Information we collect</h2>
        <p>When you submit an inquiry: your name, email, phone number, contact preferences, client category, service of interest, preferred language, optional preferred date or time, and a short description of your request. We also record when you consent and submit your inquiry. Please do not include sensitive personal or financial information.</p>
        <h2 className="text-xl font-semibold">Why we collect it</h2>
        <p>Only to respond to your inquiry and discuss whether and how we can help.</p>
        <h2 className="text-xl font-semibold">Storage and access</h2>
        <p>Inquiries are stored securely in Lovable Cloud. Public visitors cannot read, change, or delete inquiry records. The site owner can review submissions through the private Cloud management area; the website administrator dashboard will be added separately.</p>
        <h2 className="text-xl font-semibold">Your requests</h2>
        <p>You may request access to or deletion of your information by contacting the consultant.</p>
        <h2 className="text-xl font-semibold">Third-party services</h2>
        <p>The website uses hosting, database, and font services from third-party providers. <Placeholder>[List to be confirmed]</Placeholder></p>
      </div>
    </>
  );
}
