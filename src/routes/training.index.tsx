import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, pageHead } from "@/components/site/PageHeader";
import { CtaBand } from "@/components/site/Sections";
import { courses } from "@/content/catalog";

export const Route = createFileRoute("/training/")({
  head: () => pageHead("Training & Courses in Tax, VAT & Accounting | Tax Compass", "Practical training in income tax, VAT, accounting, corporate compliance and online return filing in Bangladesh.", "/training"),
  component: Training,
});

export const studentJourney = ["Enquire", "Register", "Confirm admission", "Start learning", "Complete course", "Certificate (if applicable)"];

function Training() {
  return (
    <>
      <PageHeader eyebrow="Training & Courses" title="Practical professional training">Courses for students, accountants, finance staff and business owners.</PageHeader>
      <div className="container-page py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c) => (
            <article key={c.slug} className="flex flex-col border bg-card p-6">
              <GraduationCap className="h-6 w-6 text-gold" aria-hidden />
              <h2 className="mt-4 text-lg font-semibold">{c.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.overview}</p>
              <Button asChild size="sm" variant="outline" className="mt-5 self-start"><Link to="/training/$slug" params={{ slug: c.slug }}>View course</Link></Button>
            </article>
          ))}
        </div>
        <h2 className="mt-16 text-2xl font-semibold">Student journey</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {studentJourney.map((s, i) => <li key={s} className="border-t-2 border-gold pt-3"><span className="font-serif text-2xl text-gold">{i + 1}</span><p className="mt-1 font-medium text-primary">{s}</p></li>)}
        </ol>
      </div>
      <CtaBand title="Interested in a course?" text="Send an enquiry and we will share the next available batch." />
    </>
  );
}
