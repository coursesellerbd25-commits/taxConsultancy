import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Placeholder, pageHead } from "@/components/site/PageHeader";
import { useServices, useSite } from "@/lib/site-data";

export const Route = createFileRoute("/contact")({
  head: () => pageHead("Contact Us | Corporate Tax Bangladesh Bangladesh", "Get in touch to request a tax or VAT consultation in Bangladesh.", "/contact"),
  component: Contact,
});

function Contact() {
  const site = useSite();
  const wa = site.whatsappNumber
    ? `https://wa.me/${site.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(site.whatsappMessage)}`
    : null;
  const items = [
    site.contactEmail && { icon: Mail, label: "Email", value: site.contactEmail, href: `mailto:${site.contactEmail}` },
    site.contactPhone && { icon: Phone, label: "Phone", value: site.contactPhone, href: `tel:${site.contactPhone}` },
    site.officeAddress && { icon: MapPin, label: "Office", value: site.officeAddress },
    site.businessHours && { icon: Clock, label: "Hours", value: site.businessHours },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string }[];

  return (
    <>
      <PageHeader eyebrow="Contact" title="Get in touch">
        The quickest way to reach the consultant is through the consultation request form.
      </PageHeader>
      <div className="container-page grid gap-10 py-14 md:grid-cols-2">
        <div className="rounded-md border bg-card p-8">
          <h2 className="text-2xl font-semibold">Request a consultation</h2>
          <p className="mt-2 text-muted-foreground">Describe briefly what you need help with. Please do not include sensitive personal or financial details.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg"><Link to="/consultation">Open the request form</Link></Button>
            {wa && (
              <Button asChild size="lg" variant="outline">
                <a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle /> Contact on WhatsApp</a>
              </Button>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Contact details</h2>
          {items.length ? (
            <ul className="mt-4 space-y-4">
              {items.map((i) => (
                <li key={i.label} className="flex gap-3">
                  <i.icon className="mt-0.5 h-5 w-5 text-gold" aria-hidden />
                  <div>
                    <p className="text-sm text-muted-foreground">{i.label}</p>
                    {i.href ? <a href={i.href} className="font-medium text-primary hover:underline">{i.value}</a> : <p className="font-medium">{i.value}</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4"><Placeholder>[Placeholder: email, phone, WhatsApp, address and hours appear here once confirmed]</Placeholder></p>
          )}
          {site.officeAddress && (
            <iframe title="Office location map" src={`https://www.google.com/maps?q=${encodeURIComponent(site.officeAddress)}&output=embed`} className="mt-6 h-64 w-full rounded-md border" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          )}
          {site.socialLinks.length > 0 && (
            <ul className="mt-6 flex gap-4 text-sm">
              {site.socialLinks.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{s.label}</a></li>)}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
