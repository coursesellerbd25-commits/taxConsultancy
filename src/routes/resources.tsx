import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageHeader, pageHead } from "@/components/site/PageHeader";
import { NBR_URL } from "@/content/site";

export const Route = createFileRoute("/resources")({
  head: () => pageHead("Knowledge Center | Tax, VAT & Company Registration Guides | Tax Compass", "Educational articles on income tax, VAT, TIN, and tax documentation in Bangladesh.", "/resources"),
  component: Resources,
});

const categories = ["Income Tax Guides", "Corporate Tax Guides", "VAT Guides", "TIN and BIN Guides", "Business Registration Guides", "RJSC and Company Law", "Foreign Investment", "Accounting and Bookkeeping", "Regulatory Compliance", "Tax Updates and News"];

function Resources() {
  return (
    <>
      <PageHeader eyebrow="Tax Resources" title="Tax Knowledge Center">
        Educational guides on tax, VAT, registration and compliance.
      </PageHeader>
      <div className="container-page py-14">
        <h2 className="text-xl font-semibold">Categories</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => <li key={c} className="rounded-sm border bg-card px-3 py-1.5 text-sm">{c}</li>)}
        </ul>
        <div className="mt-10 rounded-md border border-dashed bg-card p-8">
          <p className="font-medium text-primary">No articles published yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">Articles are reviewed by the consultant before publication, with a clear last-verified date.</p>
        </div>
        <div className="mt-10 rounded-md bg-surface p-6">
          <h2 className="text-lg font-semibold">Official source</h2>
          <p className="mt-2 text-sm text-muted-foreground">For current rates, deadlines, and official notices, always refer to the National Board of Revenue.</p>
          <a href={NBR_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            National Board of Revenue (nbr.gov.bd) <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </>
  );
}
