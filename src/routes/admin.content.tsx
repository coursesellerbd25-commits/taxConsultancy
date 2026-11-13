
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  FileText,
  HelpCircle,
  Home,
  Image,
  Mail,
  MessageSquareText,
  Palette,
  GraduationCap,
  Settings2,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/admin/content")({
  component: WebsiteContentPage,
});

const contentSections = [
  {
    title: "Homepage",
    description:
      "Manage your homepage introduction, business identity, hero content, and main website messaging.",
    path: "/admin/content/home",
    icon: Home,
    category: "Website Pages",
  },
  {
    title: "About Us",
    description:
      "Update consultant information, company biography, and the content that introduces your business.",
    path: "/admin/content/about",
    icon: Building2,
    category: "Website Pages",
  },
  {
    title: "Services & Business Solutions",
    description:
      "Create, edit, publish, hide, and organize the professional tax and consultancy services displayed on your website.",
    path: "/admin/content/services",
    icon: BriefcaseBusiness,
    category: "Business Content",
  },
  {
    title: "Training & Learning",
    description:
      "Manage training programs, learning objectives, course details, documents, and learning resources.",
    path: "/admin/content/training",
    icon: GraduationCap,
    category: "Business Content",
  },
  {
    title: "Tax Resources Library",
    description:
      "Upload tax documents, guides, presentations, and useful external resources for website visitors.",
    path: "/admin/content/resources",
    icon: BookOpen,
    category: "Business Content",
  },
  {
    title: "Frequently Asked Questions",
    description:
      "Create and organize FAQs to help visitors understand your services and common tax-related questions.",
    path: "/admin/content/faqs",
    icon: HelpCircle,
    category: "Website Pages",
  },
  {
    title: "Contact Information",
    description:
      "Update business contact details, phone numbers, WhatsApp information, office address, and business hours.",
    path: "/admin/content/contact",
    icon: Mail,
    category: "Website Pages",
  },
];

function ContentCard({
  item,
}: {
  item: (typeof contentSections)[number];
}) {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#B7792B]/50 hover:shadow-md sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#243653]/5 text-[#243653] transition group-hover:bg-[#243653] group-hover:text-white">
          <Icon size={23} strokeWidth={1.8} />
        </div>

        <span className="rounded-full bg-[#B7792B]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#9A6121]">
          {item.category}
        </span>
      </div>

      <h3 className="mt-5 text-base font-semibold text-[#243653] transition group-hover:text-[#B7792B]">
        {item.title}
      </h3>

      <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
        {item.description}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm font-semibold text-[#243653]">
          Manage content
        </span>

        <ArrowRight
          size={17}
          className="text-[#B7792B] transition-transform group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}

function WebsiteContentPage() {
  const location = useLocation();

  // Show the CMS overview only at /admin/content.
  // Child routes render inside the Outlet.
  const isContentIndex =
    location.pathname.replace(/\/$/, "") === "/admin/content";

  if (!isContentIndex) {
    return <Outlet />;
  }

  const websitePages = contentSections.filter(
    (item) => item.category === "Website Pages"
  );

  const businessContent = contentSections.filter(
    (item) => item.category === "Business Content"
  );

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#B7792B]">
            <Palette size={17} />
            <span>Content Management System</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#243653] sm:text-3xl">
            Website Content
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage and customize the content displayed across your Corporate
            Tax Bangladesh website. Choose a section below to get started.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
          <Settings2 size={16} className="text-[#B7792B]" />
          <span>Website CMS</span>
        </div>
      </div>

      {/* Intro banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#243653] p-5 text-white sm:p-7">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-[#E9C58F]">
            <Sparkles size={14} />
            Content workspace
          </div>

          <h2 className="text-xl font-semibold sm:text-2xl">
            Keep your website up to date
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-200">
            Update your business information, publish services, organize
            training materials, and maintain useful resources without
            manually changing website code.
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-200">
            <span className="inline-flex items-center gap-1.5">
              <FileText size={14} />
              Page management
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquareText size={14} />
              Content updates
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Image size={14} />
              Resource management
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-[#B7792B]/15 blur-3xl" />
      </div>

      {/* Website pages */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#243653]">
              Website Pages
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage the main pages and information visitors see.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {websitePages.length} sections
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {websitePages.map((item) => (
            <ContentCard key={item.path} item={item} />
          ))}
        </div>
      </section>

      {/* Business content */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#243653]">
              Business Content
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your professional services, training, and learning
              resources.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {businessContent.length} sections
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {businessContent.map((item) => (
            <ContentCard key={item.path} item={item} />
          ))}
        </div>
      </section>

      {/* Helpful note */}
      <div className="flex items-start gap-3 rounded-xl border border-[#B7792B]/20 bg-[#B7792B]/5 p-4">
        <div className="mt-0.5 text-[#B7792B]">
          <Sparkles size={18} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#243653]">
            Content publishing tip
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Changes made in these sections are intended to update the public
            website through the connected content system. Make sure each
            section's public page reads from the same Supabase data before
            publishing changes.
          </p>
        </div>
      </div>
    </div>
  );
}
