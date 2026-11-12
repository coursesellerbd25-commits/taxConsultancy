import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeader, Placeholder, pageHead } from "@/components/site/PageHeader";
import { InquiryForm } from "@/components/site/InquiryForm";
import { COURSE_PREFIX, findCourse } from "@/content/catalog";
import { faqGroups } from "@/content/faqs";

export const Route = createFileRoute("/training/$slug")({
  loader: ({ params }) => { const c = findCourse(params.slug); if (!c) throw notFound(); return c; },
  head: ({ loaderData }) => loaderData
    ? pageHead(`${loaderData.title} | Corporate Tax Bangladesh Training`, loaderData.overview, `/training/${loaderData.slug}`)
    : { meta: [{ title: "Course not found" }, { name: "robots", content: "noindex" }] },
  component: Course,
});

function Course() {
  const c = Route.useLoaderData();
  const details = [["Instructor", "[Placeholder: instructor profile]"], ["Duration", "[Placeholder: duration]"], ["Class schedule", "[Placeholder: schedule]"], ["Course fee", "[Placeholder: fee]"], ["Certificate", "[Placeholder: only if verified]"]];
  const faqs = faqGroups.find((g) => g.category === "Training")?.items ?? [];
  return (
    <>
      <PageHeader eyebrow="Course" title={c.title}>{c.overview}</PageHeader>
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-12">
          <section><h2 className="text-2xl font-semibold">Who should join</h2><p className="mt-3 text-muted-foreground">{c.audience}</p></section>
          <section><h2 className="text-2xl font-semibold">Learning objectives</h2><ul className="mt-4 space-y-2">{c.objectives.map((o) => <li key={o} className="flex gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />{o}</li>)}</ul></section>
          <section><h2 className="text-2xl font-semibold">Syllabus</h2><ol className="mt-4 divide-y border">{c.syllabus.map((m, i) => <li key={m} className="flex gap-4 p-4"><span className="font-serif text-gold">Module {i + 1}</span><span>{m}</span></li>)}</ol></section>
          <section><h2 className="text-2xl font-semibold">FAQs</h2><Accordion type="single" collapsible className="mt-4">{faqs.map((f) => <AccordionItem key={f.q} value={f.q}><AccordionTrigger className="text-left">{f.q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{f.a}</AccordionContent></AccordionItem>)}</Accordion></section>
          <section id="enrol" className="border bg-card p-6 md:p-8"><InquiryForm defaultService={COURSE_PREFIX + c.slug} title="Enrolment enquiry" /></section>
        </div>
        <aside className="self-start border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-primary">Course details</h2>
          <dl className="mt-4 space-y-3 text-sm">{details.map(([k, v]) => <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="mt-0.5"><Placeholder>{v}</Placeholder></dd></div>)}</dl>
          <a href="#enrol" className="mt-6 block rounded-md bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90">Enquire to enrol</a>
          <Link to="/training" className="mt-4 block text-sm text-primary hover:underline">← All courses</Link>
        </aside>
      </div>
    </>
  );
}
