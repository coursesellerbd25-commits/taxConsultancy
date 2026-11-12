import { createFileRoute, Link } from "@tanstack/react-router";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Placeholder, pageHead } from "@/components/site/PageHeader";
import { useServices, useSite } from "@/lib/site-data";

export const Route = createFileRoute("/about")({
  head: () => pageHead("About Us | Corporate Tax Bangladesh", "Professional profile, qualifications, and approach of a Bangladesh-based tax practitioner and VAT consultant.", "/about"),
  component: About,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b py-8 last:border-0">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 text-muted-foreground">{children}</div>
    </section>
  );
}

function About() {
  const site = useSite();
  const services = useServices();
  return (
    <>
      <PageHeader eyebrow="About" title={site.consultantName ?? "About the Consultant"}>
        A tax practitioner and VAT consultant serving individuals and businesses in Bangladesh.
      </PageHeader>
      <div className="container-page grid gap-12 py-14 md:grid-cols-3">
        <aside>
          <div className="flex aspect-[4/5] items-center justify-center rounded-md border bg-surface">
            <div className="text-center">
              <UserRound className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden />
              <p className="mt-2 text-sm text-muted-foreground">Professional photograph</p>
              <Placeholder>[To be provided]</Placeholder>
            </div>
          </div>
        </aside>
        <div className="md:col-span-2">
          <Section title="Professional biography">
            {site.biography ?? <Placeholder>[Placeholder: professional biography to be written by the owner]</Placeholder>}
          </Section>
          <Section title="Qualifications and certifications">
            {site.credentials.length ? <ul className="list-disc pl-5">{site.credentials.map((c) => <li key={c}>{c}</li>)}</ul>
              : <Placeholder>[Placeholder: only verified qualifications will be listed]</Placeholder>}
          </Section>
          <Section title="Professional experience">
            <Placeholder>[Placeholder: relevant experience to be confirmed by the owner]</Placeholder>
          </Section>
          <Section title="Areas of specialization">
            <ul className="grid gap-1 sm:grid-cols-2">
              {services.map((s) => <li key={s.slug}>· {s.title}</li>)}
            </ul>
          </Section>
          <Section title="Professional approach">
            Each consultation begins by understanding your situation, explaining relevant general requirements clearly,
            and helping you organize the documentation you may need. General information is not a substitute for
            advice tailored to your circumstances.
          </Section>
          <Section title="Professional affiliations">
            {site.affiliations.length ? <ul className="list-disc pl-5">{site.affiliations.map((a) => <li key={a}>{a}</li>)}</ul>
              : <Placeholder>[Placeholder: verified affiliations only, if applicable]</Placeholder>}
          </Section>
          <Button asChild size="lg" className="mt-6"><Link to="/consultation">Request a Consultation</Link></Button>
        </div>
      </div>
    </>
  );
}
