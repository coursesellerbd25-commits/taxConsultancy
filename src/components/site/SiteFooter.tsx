import { Link } from "@tanstack/react-router";
import { useSite } from "@/lib/site-data";

const mainServices = [
  { label: "Individual Tax", category: "taxation" },
  { label: "Corporate Tax", category: "taxation" },
  { label: "VAT Consultancy", category: "vat" },
  { label: "Accounting", category: "accounting" },
  { label: "Business Registration", category: "business-registration" },
  { label: "Foreign Investment", category: "foreign-investment" },
];

export function SiteFooter() {
  const site = useSite();
  const year = new Date().getFullYear();
  const wa = site.whatsappNumber ? `https://wa.me/${site.whatsappNumber.replace(/\D/g, "")}` : null;
  const linkCls = "text-primary-foreground/80 hover:text-gold";
  return (
    <footer className="bg-navy-deep text-primary-foreground">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-xl text-primary-foreground">{site.businessName}</p>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70">
            Tax, VAT, accounting and corporate compliance guidance for individuals, businesses and investors in Bangladesh.
          </p>
          <Link to="/consultation" className="mt-4 inline-block text-sm font-medium text-gold hover:underline">Book a consultation →</Link>
        </div>
        <div>
          <p className="eyebrow">Main Services</p>
          <ul className="mt-3 space-y-2 text-sm">
            {mainServices.map((s) => <li key={s.label}><Link to="/services/$category" params={{ category: s.category }} className={linkCls}>{s.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Resources</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/resources" className={linkCls}>Tax Guides</Link></li>
            <li><Link to="/resources" className={linkCls}>VAT Guides</Link></li>
            <li><Link to="/resources" className={linkCls}>Blog</Link></li>
            <li><Link to="/faqs" className={linkCls}>FAQs</Link></li>
            <li><Link to="/training" className={linkCls}>Training</Link></li>
            <li><Link to="/company-registration" className={linkCls}>Company Registration Process</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
            <li>Phone: {site.contactPhone ? <a href={`tel:${site.contactPhone}`} className="hover:text-gold">{site.contactPhone}</a> : <span className="text-primary-foreground/50">[to be added]</span>}</li>
            <li>Email: {site.contactEmail ? <a href={`mailto:${site.contactEmail}`} className="hover:text-gold">{site.contactEmail}</a> : <span className="text-primary-foreground/50">[to be added]</span>}</li>
            <li>Address: {site.officeAddress ?? <span className="text-primary-foreground/50">[to be added]</span>}</li>
            <li>WhatsApp: {wa ? <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-gold">Message us</a> : <span className="text-primary-foreground/50">[to be added]</span>}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-primary-foreground/60 md:flex-row md:items-center md:justify-between">
          <p>© {year} {site.businessName}. All rights reserved.</p>
          <ul className="flex flex-wrap gap-4">
            <li><Link to="/privacy" className="hover:text-gold">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-gold">Terms of Service</Link></li>
            <li><Link to="/disclaimer" className="hover:text-gold">Disclaimer</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
