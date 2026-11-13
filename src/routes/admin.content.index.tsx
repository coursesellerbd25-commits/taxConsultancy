
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CircleHelp,
  FileText,
  Home,
  Info,
  Mail,
  MessageSquareText,
  Settings2,
} from "lucide-react";

export const Route = createFileRoute("/admin/content/")({
  component: ContentOverview,
});

const contentSections = [
  {
    title: "Homepage",
    description:
      "Manage the homepage business name, hero tagline, and introductory content.",
    path: "/admin/content/home",
    icon: Home,
    label: "Main landing page",
  },
  {
    title: "Business Solutions",
    description:
      "Add, edit, publish, hide, and organize the services displayed on your website.",
    path: "/admin/content/business-solutions",
    icon: Building2,
    label: "Services and solutions",
  },
  {
    title: "About Us",
    description:
      "Manage the consultant introduction, professional biography, and about-page content.",
    path: "/admin/about",
    icon: Info,
    label: "Company information",
  },
  {
    title: "Contact Information",
    description:
      "Update business contact details, phone numbers, WhatsApp, office address, and business hours.",
    path: "/admin/content/contact",
    icon: Mail,
    label: "Business contact details",
  },
  {
    title: "Frequently Asked Questions",
    description:
      "Create, edit, organize, publish, or hide frequently asked questions.",
    path: "/admin/content/faqs",
    icon: CircleHelp,
    label: "FAQs",
  },
];

function ContentOverview() {
  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-[#B7792B]">
            <Settings2 size={16} />
            <span className="font-medium">Website Management</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#243653] sm:text-3xl">
            Content Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage the content and information displayed across your Corporate
            Tax Bangladesh website from one place.
          </p>
        </div>
      </div>

      {/* Overview banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#243653] p-6 text-white shadow-sm sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90">
            <FileText size={14} />
            Website content center
          </div>

          <h2 className="text-xl font-semibold sm:text-2xl">
            Keep your website up to date
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-200 sm:text-base">
            Update your business information, manage services, maintain FAQs,
            and keep your public-facing content accurate without manually
            editing website code.
          </p>
        </div>

        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-28 right-20 h-64 w-64 rounded-full border-[35px] border-[#B7792B]/20" />
      </div>

      {/* Section heading */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#243653]">
              Website Sections
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a section to manage its content.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {contentSections.length} sections
          </span>
        </div>

        {/* Content section cards */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {contentSections.map((section) => {
            const Icon = section.icon;

            return (
              <Link
                key={section.title}
                to={section.path}
                className="group flex min-h-[205px] flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#B7792B]/50 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#243653]/5 text-[#243653] transition-colors group-hover:bg-[#243653] group-hover:text-white">
                    <Icon size={21} strokeWidth={1.8} />
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-[#B7792B]"
                  />
                </div>

                <div className="mt-5">
                  <h3 className="font-semibold text-[#243653]">
                    {section.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {section.description}
                  </p>
                </div>

                <div className="mt-auto pt-5">
                  <span className="text-xs font-medium text-[#B7792B]">
                    {section.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Additional guidance */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[#B7792B]">
            <MessageSquareText size={19} />
          </div>

          <div>
            <h3 className="font-semibold text-[#243653]">
              Content management tip
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Remember to save your changes after editing a section. Published
              content is intended for display on the public website, while
              hidden content remains available for future editing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
