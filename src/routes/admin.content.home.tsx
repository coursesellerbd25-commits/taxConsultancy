
import { createFileRoute } from "@tanstack/react-router";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Home,
  Type,
  FileText,
  BarChart3,
  Building2,
  ClipboardList,
  Workflow,
  MessageSquareQuote,
  Eye,
  Save,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Plus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/content/home")({
  component: HomeContentPage,
});

/* -------------------------------------------------------
   TYPES
------------------------------------------------------- */

type HeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  primary_cta: string;
  secondary_cta: string;
};

type Statistic = {
  value: string;
  label: string;
};

type Principle = {
  title: string;
  description: string;
};

type AboutContent = {
  eyebrow: string;
  title: string;
  description: string;
  mission: string;
  vision: string;
  credentials: string;
  link_label: string;
  principles: Principle[];
};

type ProcessStep = {
  title: string;
  description: string;
};

type RegistrationContent = {
  eyebrow: string;
  title: string;
  link_label: string;
  disclaimer: string;
  steps: ProcessStep[];
};

type HowItWorksContent = {
  eyebrow: string;
  title: string;
  disclaimer: string;
  steps: ProcessStep[];
};

type Testimonial = {
  quote: string;
  name: string;
  service: string;
};

type TestimonialsContent = {
  eyebrow: string;
  title: string;
  items: Testimonial[];
};

type HomepageContent = {
  hero: HeroContent;
  statistics: Statistic[];
  about: AboutContent;
  registration: RegistrationContent;
  how_it_works: HowItWorksContent;
  testimonials: TestimonialsContent;
};

type SectionKey =
  | "hero"
  | "statistics"
  | "about"
  | "registration"
  | "how_it_works"
  | "testimonials";

/* -------------------------------------------------------
   DEFAULT CONTENT

   Used when homepage_content has no saved record yet.
   These are initial editable values, not a replacement
   for your public homepage layout.
------------------------------------------------------- */

const defaultContent: HomepageContent = {
  hero: {
    eyebrow: "Tax · VAT · Corporate Compliance",
    title:
      "Your Trusted Partner for Tax, VAT & Corporate Compliance in Bangladesh",
    description:
      "Navigate taxation, VAT, business registration, accounting, and regulatory compliance with professional guidance tailored to your needs.",
    primary_cta: "Book a Consultation",
    secondary_cta: "Explore Our Services",
  },

  statistics: [
    {
      value: "—",
      label: "Years of Professional Experience",
    },
    {
      value: "—",
      label: "Clients Served",
    },
    {
      value: "—",
      label: "Tax Returns & Compliance Filings",
    },
    {
      value: "—",
      label: "Professional Service Areas",
    },
  ],

  about: {
    eyebrow: "About",
    title: "Professional guidance, communicated clearly",
    description:
      "Add your consultancy introduction here. Explain your professional background, experience, and how you help individuals and businesses manage their compliance requirements.",
    mission:
      "Mission: make compliance understandable and manageable.",
    vision:
      "Vision: a trusted, accessible compliance partner for every client we serve.",
    credentials: "Add verified qualifications and experience.",
    link_label: "Learn More About Us",
    principles: [
      {
        title: "Transparency",
        description:
          "Scope and fees are discussed clearly before work begins.",
      },
      {
        title: "Client-focused",
        description:
          "Every engagement starts by understanding your situation.",
      },
      {
        title: "Confidentiality",
        description:
          "Your information is used only to serve your request.",
      },
      {
        title: "Professional responsibility",
        description:
          "General guidance only within verified professional scope.",
      },
    ],
  },

  registration: {
    eyebrow: "Company registration",
    title: "Your company registration journey",
    link_label: "See the full process",
    disclaimer:
      "Registration and approval timelines depend on the relevant authorities and are not guaranteed.",
    steps: [
      {
        title: "Initial consultation",
        description:
          "Understand the proposed business structure and requirements.",
      },
      {
        title: "Company name search",
        description:
          "Check proposed name availability and relevant requirements.",
      },
      {
        title: "Document preparation",
        description:
          "Prepare the required company information and incorporation documents.",
      },
      {
        title: "Application and submission",
        description:
          "Assist with the relevant RJSC submission process.",
      },
      {
        title: "Registration and documentation",
        description:
          "Assist with obtaining the relevant incorporation documents.",
      },
      {
        title: "Post-registration compliance",
        description:
          "Explain TIN, trade license, BIN, bank account and other requirements.",
      },
    ],
  },

  how_it_works: {
    eyebrow: "How it works",
    title: "A clear path from enquiry to completion",
    disclaimer:
      "Submitting an enquiry does not create a professional-client relationship. Engagement and fees are agreed before any work begins.",
    steps: [
      {
        title: "Choose your service",
        description: "",
      },
      {
        title: "Submit an enquiry",
        description: "",
      },
      {
        title: "Receive initial consultation",
        description: "",
      },
      {
        title: "Discuss requirements and fees",
        description: "",
      },
      {
        title: "Submit required documents",
        description: "",
      },
      {
        title: "Receive professional assistance",
        description: "",
      },
      {
        title: "Track progress and updates",
        description: "",
      },
    ],
  },

  testimonials: {
    eyebrow: "Client feedback",
    title: "What clients say",
    items: [
      {
        quote: "Add verified client feedback here.",
        name: "Client name",
        service: "Service received",
      },
      {
        quote: "Add verified client feedback here.",
        name: "Client name",
        service: "Service received",
      },
      {
        quote: "Add verified client feedback here.",
        name: "Client name",
        service: "Service received",
      },
    ],
  },
};

/* -------------------------------------------------------
   STYLES
------------------------------------------------------- */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10";

const textareaClass =
  "w-full min-h-28 resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10";

/* -------------------------------------------------------
   REUSABLE FIELD
------------------------------------------------------- */

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[#243653]">
        {label}
      </label>

      {children}

      {hint && (
        <p className="text-xs leading-5 text-slate-500">{hint}</p>
      )}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      {multiline ? (
        <textarea
          rows={rows}
          className={textareaClass}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={inputClass}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      )}
    </Field>
  );
}

function EditorCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
        <h2 className="font-bold text-[#243653]">{title}</h2>
        {description && (
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-5 p-5 sm:p-7">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------
   SECTION NAVIGATION
------------------------------------------------------- */

const sections: {
  id: SectionKey;
  label: string;
  description: string;
  icon: typeof Home;
}[] = [
  {
    id: "hero",
    label: "Hero Section",
    description: "Main headline and introduction",
    icon: Type,
  },
  {
    id: "statistics",
    label: "Statistics",
    description: "Business figures and highlights",
    icon: BarChart3,
  },
  {
    id: "about",
    label: "About Section",
    description: "Introduction, mission and values",
    icon: Building2,
  },
  {
    id: "registration",
    label: "Registration Process",
    description: "Company registration journey",
    icon: ClipboardList,
  },
  {
    id: "how_it_works",
    label: "How It Works",
    description: "Customer journey steps",
    icon: Workflow,
  },
  {
    id: "testimonials",
    label: "Testimonials",
    description: "Client feedback and names",
    icon: MessageSquareQuote,
  },
];

/* -------------------------------------------------------
   MAIN PAGE
------------------------------------------------------- */

function HomeContentPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<HomepageContent>(defaultContent);
  const [originalForm, setOriginalForm] =
    useState<HomepageContent>(defaultContent);

  const [activeSection, setActiveSection] =
    useState<SectionKey>("hero");

  const [notice, setNotice] = useState("");
  const [validationError, setValidationError] = useState("");

  const settingsQuery = useQuery({
    queryKey: ["admin-home-content"],

    queryFn: async (): Promise<HomepageContent> => {
      // The table may not yet exist in older generated Supabase types.
      // Regenerate your Supabase types after creating homepage_content.
      const { data, error } = await (supabase as any)
        .from("homepage_content")
        .select("content")
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;

      if (!data?.content) {
        return structuredClone(defaultContent);
      }

      return {
        ...defaultContent,
        ...data.content,
        hero: {
          ...defaultContent.hero,
          ...data.content.hero,
        },
        about: {
          ...defaultContent.about,
          ...data.content.about,
          principles:
            data.content.about?.principles ??
            defaultContent.about.principles,
        },
        registration: {
          ...defaultContent.registration,
          ...data.content.registration,
          steps:
            data.content.registration?.steps ??
            defaultContent.registration.steps,
        },
        how_it_works: {
          ...defaultContent.how_it_works,
          ...data.content.how_it_works,
          steps:
            data.content.how_it_works?.steps ??
            defaultContent.how_it_works.steps,
        },
        testimonials: {
          ...defaultContent.testimonials,
          ...data.content.testimonials,
          items:
            data.content.testimonials?.items ??
            defaultContent.testimonials.items,
        },
        statistics:
          data.content.statistics ?? defaultContent.statistics,
      } as HomepageContent;
    },
  });

  useEffect(() => {
    if (!settingsQuery.data) return;

    const loaded = structuredClone(settingsQuery.data);

    setForm(loaded);
    setOriginalForm(loaded);
  }, [settingsQuery.data]);

  const hasChanges =
    JSON.stringify(form) !== JSON.stringify(originalForm);

  function updateHero<K extends keyof HeroContent>(
    field: K,
    value: HeroContent[K]
  ) {
    setForm((previous) => ({
      ...previous,
      hero: {
        ...previous.hero,
        [field]: value,
      },
    }));

    setNotice("");
    setValidationError("");
  }

  function updateStatistic(
    index: number,
    field: keyof Statistic,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      statistics: previous.statistics.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));

    setNotice("");
  }

  function updateAbout<K extends keyof AboutContent>(
    field: K,
    value: AboutContent[K]
  ) {
    setForm((previous) => ({
      ...previous,
      about: {
        ...previous.about,
        [field]: value,
      },
    }));

    setNotice("");
  }

  function updatePrinciple(
    index: number,
    field: keyof Principle,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      about: {
        ...previous.about,
        principles: previous.about.principles.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));

    setNotice("");
  }

  function updateRegistration<K extends keyof RegistrationContent>(
    field: K,
    value: RegistrationContent[K]
  ) {
    setForm((previous) => ({
      ...previous,
      registration: {
        ...previous.registration,
        [field]: value,
      },
    }));

    setNotice("");
  }

  function updateRegistrationStep(
    index: number,
    field: keyof ProcessStep,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      registration: {
        ...previous.registration,
        steps: previous.registration.steps.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));

    setNotice("");
  }

  function updateHowItWorks<K extends keyof HowItWorksContent>(
    field: K,
    value: HowItWorksContent[K]
  ) {
    setForm((previous) => ({
      ...previous,
      how_it_works: {
        ...previous.how_it_works,
        [field]: value,
      },
    }));

    setNotice("");
  }

  function updateHowItWorksStep(
    index: number,
    field: keyof ProcessStep,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      how_it_works: {
        ...previous.how_it_works,
        steps: previous.how_it_works.steps.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));

    setNotice("");
  }

  function updateTestimonials<K extends keyof TestimonialsContent>(
    field: K,
    value: TestimonialsContent[K]
  ) {
    setForm((previous) => ({
      ...previous,
      testimonials: {
        ...previous.testimonials,
        [field]: value,
      },
    }));

    setNotice("");
  }

  function updateTestimonial(
    index: number,
    field: keyof Testimonial,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      testimonials: {
        ...previous.testimonials,
        items: previous.testimonials.items.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));

    setNotice("");
  }

  const saveMutation = useMutation({
    mutationFn: async (values: HomepageContent) => {
      const { error } = await (supabase as any)
        .from("homepage_content")
        .upsert(
          {
            id: 1,
            content: values,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (error) throw error;
    },

    onSuccess: async (_, savedValues) => {
      const saved = structuredClone(savedValues);

      setOriginalForm(saved);
      setForm(saved);
      setNotice("Homepage content saved successfully.");
      setValidationError("");

      await queryClient.invalidateQueries({
        queryKey: ["admin-home-content"],
      });
    },
  });

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setNotice("");
    setValidationError("");

    if (!form.hero.title.trim()) {
      setValidationError("Please enter the homepage hero headline.");
      setActiveSection("hero");
      return;
    }

    if (!form.hero.description.trim()) {
      setValidationError("Please enter the homepage hero description.");
      setActiveSection("hero");
      return;
    }

    if (form.statistics.some((item) => !item.label.trim())) {
      setValidationError("Every statistic must have a label.");
      setActiveSection("statistics");
      return;
    }

    if (
      form.registration.steps.some(
        (step) => !step.title.trim() || !step.description.trim()
      )
    ) {
      setValidationError(
        "Every registration step needs a title and description."
      );
      setActiveSection("registration");
      return;
    }

    if (
      form.how_it_works.steps.some((step) => !step.title.trim())
    ) {
      setValidationError(
        "Every How It Works step needs a title."
      );
      setActiveSection("how_it_works");
      return;
    }

    if (
      form.testimonials.items.some(
        (item) =>
          !item.quote.trim() ||
          !item.name.trim() ||
          !item.service.trim()
      )
    ) {
      setValidationError(
        "Complete the quote, client name and service for every testimonial."
      );
      setActiveSection("testimonials");
      return;
    }

    saveMutation.mutate(form);
  }

  function resetForm() {
    setForm(structuredClone(originalForm));
    setNotice("");
    setValidationError("");
  }

  /* -----------------------------------------------------
     LOADING / ERROR
  ----------------------------------------------------- */

  if (settingsQuery.isLoading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading homepage content...
        </div>
      </div>
    );
  }

  if (settingsQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <h2 className="font-semibold">
            Unable to load homepage content
          </h2>
        </div>

        <p className="mt-2 text-sm leading-6 text-red-600">
          {settingsQuery.error.message}
        </p>

        <button
          type="button"
          onClick={() => settingsQuery.refetch()}
          className="mt-4 rounded-lg bg-[#243653] px-4 py-2 text-sm font-semibold text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  /* -----------------------------------------------------
     MAIN LAYOUT
  ----------------------------------------------------- */

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 pb-12">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#B7792B]">
            <Home className="h-4 w-4" />
            Website Content
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#243653] sm:text-3xl">
            Homepage Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage the text displayed across your homepage without
            changing its existing design or layout.
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#243653] transition hover:bg-slate-50"
        >
          <ExternalLink className="h-4 w-4" />
          View Homepage
        </a>
      </div>

      {/* Notifications */}
      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {notice}
        </div>
      )}

      {(validationError || saveMutation.isError) && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {validationError || saveMutation.error?.message}
        </div>
      )}

      {/* Section navigation */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const active = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-[#243653] bg-[#243653] text-white shadow-md"
                  : "border-slate-200 bg-white text-[#243653] hover:border-[#243653]/40 hover:bg-slate-50"
              }`}
            >
              <span
                className={`rounded-xl p-2.5 ${
                  active
                    ? "bg-white/10 text-[#E2B96F]"
                    : "bg-[#243653]/10 text-[#243653]"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">
                  {section.label}
                </span>
                <span
                  className={`mt-1 block text-xs ${
                    active ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {section.description}
                </span>
              </span>

              <ChevronRight className="h-4 w-4 shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* HERO */}
        {activeSection === "hero" && (
          <>
            <EditorCard
              title="Hero Section"
              description="Edit the main introduction visitors see at the top of your homepage."
            >
              <TextField
                label="Eyebrow / Small Label"
                value={form.hero.eyebrow}
                onChange={(value) => updateHero("eyebrow", value)}
                placeholder="Tax · VAT · Corporate Compliance"
              />

              <TextField
                label="Main Headline"
                value={form.hero.title}
                onChange={(value) => updateHero("title", value)}
                multiline
                rows={3}
              />

              <TextField
                label="Description"
                value={form.hero.description}
                onChange={(value) => updateHero("description", value)}
                multiline
                rows={4}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  label="Primary Button Label"
                  value={form.hero.primary_cta}
                  onChange={(value) => updateHero("primary_cta", value)}
                  placeholder="Book a Consultation"
                />

                <TextField
                  label="Secondary Button Label"
                  value={form.hero.secondary_cta}
                  onChange={(value) => updateHero("secondary_cta", value)}
                  placeholder="Explore Our Services"
                />
              </div>
            </EditorCard>

            <EditorCard title="Hero Preview">
              <div className="rounded-2xl bg-[#243653] px-6 py-10 text-center sm:px-12">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#E2B96F]">
                  {form.hero.eyebrow || "Your hero label"}
                </p>

                <h2 className="mx-auto max-w-3xl text-2xl font-bold leading-tight text-white sm:text-4xl">
                  {form.hero.title || "Your headline"}
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-200">
                  {form.hero.description || "Your description"}
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <span className="rounded-lg bg-[#B7792B] px-5 py-3 text-sm font-semibold text-white">
                    {form.hero.primary_cta}
                  </span>
                  <span className="rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white">
                    {form.hero.secondary_cta}
                  </span>
                </div>
              </div>
            </EditorCard>
          </>
        )}

        {/* STATISTICS */}
        {activeSection === "statistics" && (
          <EditorCard
            title="Homepage Statistics"
            description="Edit the four statistics displayed below the hero section. Use verified figures only."
          >
            <div className="grid gap-5 md:grid-cols-2">
              {form.statistics.map((stat, index) => (
                <div
                  key={index}
                  className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#243653]">
                      Statistic {index + 1}
                    </h3>
                    <BarChart3 className="h-4 w-4 text-[#B7792B]" />
                  </div>

                  <TextField
                    label="Value"
                    value={stat.value}
                    onChange={(value) =>
                      updateStatistic(index, "value", value)
                    }
                    placeholder="e.g. 10+"
                  />

                  <TextField
                    label="Label"
                    value={stat.label}
                    onChange={(value) =>
                      updateStatistic(index, "label", value)
                    }
                    placeholder="e.g. Clients Served"
                  />
                </div>
              ))}
            </div>

            <p className="text-xs leading-5 text-slate-500">
              The four statistic cards are kept in their current
              homepage positions. You can edit their values and labels.
            </p>
          </EditorCard>
        )}

        {/* ABOUT */}
        {activeSection === "about" && (
          <>
            <EditorCard
              title="About Section"
              description="Manage the introduction and business identity displayed in the homepage About section."
            >
              <TextField
                label="Section Label"
                value={form.about.eyebrow}
                onChange={(value) => updateAbout("eyebrow", value)}
              />

              <TextField
                label="Section Heading"
                value={form.about.title}
                onChange={(value) => updateAbout("title", value)}
                multiline
              />

              <TextField
                label="Introduction"
                value={form.about.description}
                onChange={(value) => updateAbout("description", value)}
                multiline
                rows={5}
              />

              <TextField
                label="Mission Statement"
                value={form.about.mission}
                onChange={(value) => updateAbout("mission", value)}
                multiline
                rows={3}
              />

              <TextField
                label="Vision Statement"
                value={form.about.vision}
                onChange={(value) => updateAbout("vision", value)}
                multiline
                rows={3}
              />

              <TextField
                label="Qualifications / Experience Text"
                value={form.about.credentials}
                onChange={(value) => updateAbout("credentials", value)}
                multiline
                rows={3}
              />

              <TextField
                label="About Button Label"
                value={form.about.link_label}
                onChange={(value) => updateAbout("link_label", value)}
              />
            </EditorCard>

            <EditorCard
              title="Business Principles"
              description="Edit the four value cards displayed below the About introduction."
            >
              {form.about.principles.map((item, index) => (
                <div
                  key={index}
                  className="space-y-4 rounded-xl border border-slate-200 p-4"
                >
                  <h3 className="text-sm font-bold text-[#243653]">
                    Principle {index + 1}
                  </h3>

                  <TextField
                    label="Title"
                    value={item.title}
                    onChange={(value) =>
                      updatePrinciple(index, "title", value)
                    }
                  />

                  <TextField
                    label="Description"
                    value={item.description}
                    onChange={(value) =>
                      updatePrinciple(index, "description", value)
                    }
                    multiline
                  />
                </div>
              ))}
            </EditorCard>
          </>
        )}

        {/* REGISTRATION PROCESS */}
        {activeSection === "registration" && (
          <>
            <EditorCard
              title="Registration Process"
              description="Edit the company registration journey section and its six steps."
            >
              <TextField
                label="Section Label"
                value={form.registration.eyebrow}
                onChange={(value) =>
                  updateRegistration("eyebrow", value)
                }
              />

              <TextField
                label="Section Heading"
                value={form.registration.title}
                onChange={(value) =>
                  updateRegistration("title", value)
                }
                multiline
              />

              <TextField
                label="Process Link Label"
                value={form.registration.link_label}
                onChange={(value) =>
                  updateRegistration("link_label", value)
                }
              />

              {form.registration.steps.map((step, index) => (
                <div
                  key={index}
                  className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#243653] text-sm font-bold text-white">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h3 className="text-sm font-bold text-[#243653]">
                      Registration Step {index + 1}
                    </h3>
                  </div>

                  <TextField
                    label="Step Title"
                    value={step.title}
                    onChange={(value) =>
                      updateRegistrationStep(index, "title", value)
                    }
                  />

                  <TextField
                    label="Step Description"
                    value={step.description}
                    onChange={(value) =>
                      updateRegistrationStep(
                        index,
                        "description",
                        value
                      )
                    }
                    multiline
                  />
                </div>
              ))}

              <TextField
                label="Disclaimer"
                value={form.registration.disclaimer}
                onChange={(value) =>
                  updateRegistration("disclaimer", value)
                }
                multiline
                rows={3}
              />
            </EditorCard>
          </>
        )}

        {/* HOW IT WORKS */}
        {activeSection === "how_it_works" && (
          <EditorCard
            title="How It Works"
            description="Manage the customer journey displayed on your homepage."
          >
            <TextField
              label="Section Label"
              value={form.how_it_works.eyebrow}
              onChange={(value) =>
                updateHowItWorks("eyebrow", value)
              }
            />

            <TextField
              label="Section Heading"
              value={form.how_it_works.title}
              onChange={(value) =>
                updateHowItWorks("title", value)
              }
              multiline
            />

            {form.how_it_works.steps.map((step, index) => (
              <div
                key={index}
                className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#243653] text-sm font-bold text-white">
                    {index + 1}
                  </span>

                  <h3 className="text-sm font-bold text-[#243653]">
                    Journey Step {index + 1}
                  </h3>
                </div>

                <TextField
                  label="Step Title"
                  value={step.title}
                  onChange={(value) =>
                    updateHowItWorksStep(index, "title", value)
                  }
                />

                <TextField
                  label="Description (Optional)"
                  value={step.description}
                  onChange={(value) =>
                    updateHowItWorksStep(
                      index,
                      "description",
                      value
                    )
                  }
                  multiline
                />
              </div>
            ))}

            <TextField
              label="Disclaimer"
              value={form.how_it_works.disclaimer}
              onChange={(value) =>
                updateHowItWorks("disclaimer", value)
              }
              multiline
              rows={3}
            />
          </EditorCard>
        )}

        {/* TESTIMONIALS */}
        {activeSection === "testimonials" && (
          <EditorCard
            title="Client Testimonials"
            description="Edit the three testimonial cards currently displayed on your homepage. Only publish feedback shared with permission."
          >
            <TextField
              label="Section Label"
              value={form.testimonials.eyebrow}
              onChange={(value) =>
                updateTestimonials("eyebrow", value)
              }
            />

            <TextField
              label="Section Heading"
              value={form.testimonials.title}
              onChange={(value) =>
                updateTestimonials("title", value)
              }
            />

            {form.testimonials.items.map((item, index) => (
              <div
                key={index}
                className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <MessageSquareQuote className="h-5 w-5 text-[#B7792B]" />
                  <h3 className="text-sm font-bold text-[#243653]">
                    Testimonial {index + 1}
                  </h3>
                </div>

                <TextField
                  label="Client Feedback / Quote"
                  value={item.quote}
                  onChange={(value) =>
                    updateTestimonial(index, "quote", value)
                  }
                  multiline
                  rows={4}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Client Name"
                    value={item.name}
                    onChange={(value) =>
                      updateTestimonial(index, "name", value)
                    }
                  />

                  <TextField
                    label="Service Received"
                    value={item.service}
                    onChange={(value) =>
                      updateTestimonial(index, "service", value)
                    }
                  />
                </div>
              </div>
            ))}
          </EditorCard>
        )}

        {/* TEXT PREVIEW */}
        <EditorCard
          title="Current Section Preview"
          description="A quick text preview of the section you are editing."
        >
          {activeSection === "hero" && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-[#B7792B]">
                {form.hero.eyebrow}
              </p>
              <h2 className="text-2xl font-bold text-[#243653]">
                {form.hero.title}
              </h2>
              <p className="text-sm leading-7 text-slate-600">
                {form.hero.description}
              </p>
              <p className="text-sm font-semibold text-[#243653]">
                {form.hero.primary_cta} · {form.hero.secondary_cta}
              </p>
            </div>
          )}

          {activeSection === "statistics" && (
            <div className="grid grid-cols-2 gap-3">
              {form.statistics.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <p className="text-2xl font-bold text-[#243653]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeSection === "about" && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-[#B7792B]">
                {form.about.eyebrow}
              </p>
              <h2 className="text-2xl font-bold text-[#243653]">
                {form.about.title}
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {form.about.description}
              </p>
              <p className="text-sm text-slate-600">
                {form.about.mission}
              </p>
              <p className="text-sm text-slate-600">
                {form.about.vision}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {form.about.principles.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-[#243653]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "registration" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#243653]">
                {form.registration.title}
              </h2>
              {form.registration.steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <span className="font-bold text-[#B7792B]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-semibold text-[#243653]">
                      {step.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === "how_it_works" && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-[#243653]">
                {form.how_it_works.title}
              </h2>
              {form.how_it_works.steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <span className="font-bold text-[#B7792B]">
                    {index + 1}.
                  </span>
                  <div>
                    <p className="font-semibold text-[#243653]">
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="text-sm text-slate-500">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === "testimonials" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#243653]">
                {form.testimonials.title}
              </h2>
              {form.testimonials.items.map((item, index) => (
                <blockquote
                  key={index}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <p className="text-sm leading-6 text-slate-600">
                    “{item.quote}”
                  </p>
                  <p className="mt-3 text-sm font-bold text-[#243653]">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.service}
                  </p>
                </blockquote>
              ))}
            </div>
          )}
        </EditorCard>

        {/* SAVE CONTROLS */}
        <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#243653]">
              {hasChanges ? "Unsaved changes" : "All changes saved"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {hasChanges
                ? "Save your changes when you are ready."
                : "Your current editor content is saved."}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={resetForm}
              disabled={!hasChanges || saveMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-4 w-4" />
              Discard Changes
            </button>

            <button
              type="submit"
              disabled={!hasChanges || saveMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#243653] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1b2a42] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
