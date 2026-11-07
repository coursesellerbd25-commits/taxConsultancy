import { Link } from "@tanstack/react-router";
import { ChevronDown, Compass, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSite } from "@/lib/site-data";
import { categories } from "@/content/catalog";
import { SiteSearch } from "./SiteSearch";

export const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/services", label: "Services" },
  { to: "/business-solutions", label: "Business Solutions" },
  { to: "/training", label: "Training & Courses" },
  { to: "/resources", label: "Resources" },
  { to: "/faqs", label: "FAQs" },
  { to: "/contact", label: "Contact" },
] as const;

const linkCls = "whitespace-nowrap rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:text-primary data-[status=active]:font-semibold data-[status=active]:text-primary";

export function Logo({ onClick }: { onClick?: () => void }) {
  const site = useSite();
  return (
    <Link to="/" className="flex items-center gap-2" onClick={onClick}>
      <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary text-gold"><Compass className="h-5 w-5" aria-hidden /></span>
      <span className="leading-tight">
        <span className="block font-serif text-base font-semibold text-primary">{site.businessName}</span>
        <span className="hidden whitespace-nowrap text-[11px] uppercase tracking-widest text-muted-foreground sm:block xl:hidden 2xl:block">{site.tagline}</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [svcOpen, setSvcOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <SiteSearch />
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo onClick={() => setOpen(false)} />
        <nav aria-label="Main" className="hidden items-center xl:flex">
          {navItems.map((n) => n.to === "/services" ? (
            <div key={n.to} className="group relative">
              <Link to="/services" className={`${linkCls} inline-flex items-center gap-1`} aria-haspopup="true">
                Services <ChevronDown className="h-3.5 w-3.5" aria-hidden />
              </Link>
              <div className="invisible absolute left-1/2 top-full w-[40rem] -translate-x-1/2 pt-2 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="grid grid-cols-2 gap-1 rounded-md border bg-popover p-3 shadow-lg">
                  {categories.map((c) => (
                    <Link key={c.slug} to="/services/$category" params={{ category: c.slug }} className="rounded-sm p-3 hover:bg-accent">
                      <span className="block text-sm font-semibold text-primary">{c.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-1">{c.summary}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className={linkCls}>{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild className="hidden sm:inline-flex"><Link to="/consultation">Book a Consultation</Link></Button>
          <Button variant="ghost" size="icon" className="xl:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((v) => !v)}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="max-h-[calc(100dvh-7.5rem)] overflow-y-auto border-t bg-background xl:hidden">
          <div className="container-page flex flex-col py-3">
            {navItems.map((n) => n.to === "/services" ? (
              <div key={n.to} className="border-b">
                <div className="flex items-center justify-between">
                  <Link to="/services" onClick={() => setOpen(false)} className="py-3 text-base">Services</Link>
                  <Button variant="ghost" size="icon" aria-label="Show service categories" aria-expanded={svcOpen} onClick={() => setSvcOpen((v) => !v)}>
                    <ChevronDown className={`transition-transform ${svcOpen ? "rotate-180" : ""}`} />
                  </Button>
                </div>
                {svcOpen && (
                  <ul className="pb-3 pl-3">
                    {categories.map((c) => (
                      <li key={c.slug}><Link to="/services/$category" params={{ category: c.slug }} onClick={() => setOpen(false)} className="block py-2 text-sm text-muted-foreground">{c.title}</Link></li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} onClick={() => setOpen(false)} className="border-b py-3 text-base last:border-0 data-[status=active]:font-semibold data-[status=active]:text-primary">{n.label}</Link>
            ))}
            <Button asChild className="mt-3"><Link to="/consultation" onClick={() => setOpen(false)}>Book a Consultation</Link></Button>
          </div>
        </nav>
      )}
    </header>
  );
}
