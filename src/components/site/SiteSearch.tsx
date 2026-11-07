import { Link } from "@tanstack/react-router";
import { useId, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCatalog } from "@/lib/catalog-data";
import { searchSite, type SearchItem } from "@/lib/site-search";

function ResultLink({ item, close }: { item: SearchItem; close: () => void }) {
  const props = { className: "block rounded-sm px-4 py-3 hover:bg-accent focus-visible:bg-accent", onClick: close, children: <><span className="block text-sm font-medium text-primary">{item.title}</span><span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.description}</span></> };
  switch (item.kind) {
    case "service": return <Link to="/services/$category/$slug" params={{ category: item.category, slug: item.slug }} {...props} />;
    case "category": return <Link to="/services/$category" params={{ category: item.category }} {...props} />;
    case "course": return <Link to="/training/$slug" params={{ slug: item.slug }} {...props} />;
    case "calculator": return <Link to="/" hash="vat-calculator" {...props} />;
    case "page": return <Link to={item.to} {...props} />;
  }
}

export function SiteSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const catalog = useCatalog();
  const id = useId();
  const results = searchSite(catalog, query);
  const expanded = open && Boolean(query.trim());
  return (
    <div className="border-b bg-surface">
      <div className="container-page flex items-center justify-between gap-4 py-2">
        <span className="hidden text-xs font-medium text-muted-foreground sm:block">Tax · VAT · Corporate Compliance</span>
        <div className="relative w-full sm:max-w-md" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }} onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}>
          <div role="search" className="relative">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input aria-label="Search Tax Compass" aria-expanded={expanded} aria-controls={id} type="search" autoComplete="off" placeholder="Search services, courses & more…" value={query} onFocus={() => setOpen(true)} onChange={(e) => { setQuery(e.target.value); setOpen(true); }} className="bg-background pl-9 pr-10 [&::-webkit-search-cancel-button]:hidden" />
            {query && <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9" aria-label="Clear search" onClick={() => { setQuery(""); setOpen(false); }}><X className="h-4 w-4" /></Button>}
          </div>
          {expanded && <div id={id} className="absolute right-0 top-full z-50 mt-2 max-h-[60vh] w-full overflow-y-auto rounded-md border bg-popover shadow-lg">
            <p role="status" className="border-b px-4 py-2 text-xs text-muted-foreground">{results.length ? `${results.length} result${results.length === 1 ? "" : "s"}` : "No results found. Try another search."}</p>
            <ul>{results.map((item, i) => <li key={`${item.kind}-${i}`}><ResultLink item={item} close={() => { setOpen(false); setQuery(""); }} /></li>)}</ul>
          </div>}
        </div>
      </div>
    </div>
  );
}