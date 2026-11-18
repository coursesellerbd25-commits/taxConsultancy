
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
  Save,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/content/home")({
  component: HomeContentPage,
});

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type HeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  primary_button: string;
  secondary_button: string;
  serving_label: string;
  serving_text: string;
};

type Statistic = {
  id: "experience" | "clients" | "filings" | "areas";
  label: string;
  value: number | null;
};

type AboutValue = {
  id: string;
  title: string;
  text: string;
};

type AboutContent = {
  eyebrow: string;
  title: string;
  description: string;
  mission_label: string;
  mission: string;
  vision_label: string;
  vision: string;
  credentials: string[];
  button_text: string;
  values: AboutValue[];
};

type ProcessStep = {
  title: string;
  text: string;
};

type RegistrationContent = {
  eyebrow: string;
  title: string;
  link_text: string;
  steps: ProcessStep[];
  disclaimer: string;
};

type HowItWorksContent = {
  eyebrow: string;
  title: string;
  steps: ProcessStep[];
  disclaimer: string;
};

type Testimonial = {
  quote: string;
  client_name: string;
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

/* -------------------------------------------------------------------------- */
/* Default homepage content                                                   */
/* -------------------------------------------------------------------------- */

const defaultContent: HomepageContent = {
  hero: {
    eyebrow: "Tax · VAT · Corporate Compliance",
    title:
      "Your Trusted Partner for Tax, VAT & Corporate Compliance in Bangladesh",
    description:
      "Navigate taxation, VAT, business registration, accounting, and regulatory compliance with professional guidance tailored to your needs.",
    primary_button: "Book a Consultation",
    secondary_button: "Explore Our Services",
    serving_label: "Serving",
    serving_text: "Individuals · Businesses · Investors",
  },

  statistics: [
    {
      id: "experience",
      label: "Years of Professional Experience",
      value: null,
    },
    {
      id: "clients",
      label: "Clients Served",
      value: null,
    },
    {
      id: "filings",
      label: "Tax Returns & Compliance Filings",
      value: null,
    },
    {
      id: "areas",
      label: "Professional Service Areas",
      value: null,
    },
  ],

  about: {
    eyebrow: "About Corporate Tax Bangladesh",
    title: "Professional guidance, communicated clearly",
    description:
      "Corporate Tax Bangladesh helps individuals, businesses and foreign investors understand and meet their tax, VAT and corporate compliance obligations in Bangladesh — with practical, transparent and confidential support.",
    mission_label: "Mission:",
    mission: "Make compliance understandable and manageable.",
    vision_label: "Vision:",
    vision:
      "A trusted, accessible compliance partner for every client we serve.",
    credentials: [
      "Verified qualifications and experience",
    ],
    button_text: "Learn More About Us",
    values: [
      {
        id: "transparency",
        title: "Transparency",
        text: "Scope and fees are discussed clearly before work begins.",
      },
      {
        id: "client-focused",
        title: "Client-focused",
        text: "Every engagement starts by understanding your situation.",
      },
      {
        id: "confidentiality",
        title: "Confidentiality",
        text: "Your information is used only to serve your request.",
      },
      {
        id: "professional-responsibility",
        title: "Professional responsibility",
        text: "General guidance only within verified professional scope.",
      },
    ],
  },

  registration: {
    eyebrow: "Company registration",
    title: "Your company registration journey",
    link_text: "See the full process",
    steps: [
      {
        title: "Initial consultation",
        text: "Understand the proposed business structure and requirements.",
      },
      {
        title: "Company name search",
        text: "Check proposed name availability and relevant requirements.",
      },
      {
        title: "Document preparation",
        text: "Prepare the required company information and incorporation documents.",
      },
      {
        title: "Application and submission",
        text: "Assist with the relevant RJSC submission process.",
      },
      {
        title: "Registration and documentation",
        text: "Assist with obtaining the relevant incorporation documents.",
      },
      {
        title: "Post-registration compliance",
        text: "Explain TIN, trade license, BIN, bank account and other requirements.",
      },
    ],
    disclaimer:
      "Registration and approval timelines depend on the relevant authorities and are not guaranteed.",
  },

  how_it_works: {
    eyebrow: "How it works",
    title: "A clear path from enquiry to completion",
    steps: [
      { title: "Choose your service", text: "" },
      { title: "Submit an enquiry", text: "" },
      { title: "Receive initial consultation", text: "" },
      { title: "Discuss requirements and fees", text: "" },
      { title: "Submit required documents", text: "" },
      { title: "Receive professional assistance", text: "" },
      { title: "Track progress and updates", text: "" },
    ],
    disclaimer:
      "Submitting an enquiry does not create a professional-client relationship. Engagement and fees are agreed before any work begins.",
  },

  testimonials: {
    eyebrow: "Client feedback",
    title: "What clients say",
    items: [
      {
        quote: "",
        client_name: "",
        service: "",
      },
      {
        quote: "",
        client_name: "",
        service: "",
      },
      {
        quote: "",
        client_name: "",
        service: "",
      },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* Styles and reusable fields                                                 */
/* -------------------------------------------------------------------------- */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10";

const textareaClass =
  "w-full min-h-24 resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10";

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

function EditorSection({
  icon: Icon,
  number,
  title,
  description,
  children,
}: {
  icon: typeof Home;
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
        <div className="rounded-xl bg-[#243653]/10 p-2.5 text-[#243653]">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#B7792B]">
              {number}
            </span>
            <h2 className="font-bold text-[#243653]">{title}</h2>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-7">{children}</div>
    </section>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      className={inputClass}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      rows={rows}
      className={textareaClass}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Normalize stored JSONB content                                             */
/* -------------------------------------------------------------------------- */

function normalizeContent(raw: Record<string, any>): HomepageContent {
  const defaults = defaultContent;

  return {
    hero: {
      ...defaults.hero,
      ...(raw.hero ?? {}),
    },

    statistics: defaults.statistics.map((item, index) => ({
      ...item,
      ...(raw.statistics?.[index] ?? {}),
      id: item.id,
    })),

    about: {
      ...defaults.about,
      ...(raw.about ?? {}),
      credentials: Array.isArray(raw.about?.credentials)
        ? raw.about.credentials
        : defaults.about.credentials,
      values: defaults.about.values.map((item, index) => ({
        ...item,
        ...(raw.about?.values?.[index] ?? {}),
        id: item.id,
      })),
    },

    registration: {
      ...defaults.registration,
      ...(raw.registration ?? {}),
      steps: defaults.registration.steps.map((item, index) => ({
        ...item,
        ...(raw.registration?.steps?.[index] ?? {}),
      })),
    },

    how_it_works: {
      ...defaults.how_it_works,
      ...(raw.how_it_works ?? {}),
      steps: defaults.how_it_works.steps.map((item, index) => ({
        ...item,
        ...(raw.how_it_works?.steps?.[index] ?? {}),
      })),
    },

    testimonials: {
      ...defaults.testimonials,
      ...(raw.testimonials ?? {}),
      items: defaults.testimonials.items.map((item, index) => ({
        ...item,
        ...(raw.testimonials?.items?.[index] ?? {}),
      })),
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Main editor                                                                */
/* -------------------------------------------------------------------------- */

function HomeContentPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<HomepageContent>(defaultContent);
  const [originalForm, setOriginalForm] =
    useState<HomepageContent>(defaultContent);

  const [notice, setNotice] = useState("");
  const [validationError, setValidationError] = useState("");

  const settingsQuery = useQuery({
    queryKey: ["homepage-content"],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_content")
        .select("id, content, updated_at")
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;

      return normalizeContent(
        (data?.content ?? {}) as Record<string, any>
      );
    },
  });

  useEffect(() => {
    if (!settingsQuery.data) return;

    setForm(settingsQuery.data);
    setOriginalForm(settingsQuery.data);
  }, [settingsQuery.data]);

  const hasChanges =
    JSON.stringify(form) !== JSON.stringify(originalForm);

  function updateHero(
    field: keyof HeroContent,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      hero: {
        ...previous.hero,
        [field]: value,
      },
    }));
    clearMessages();
  }

  function updateAbout(
    field: keyof AboutContent,
    value: string | string[] | AboutValue[]
  ) {
    setForm((previous) => ({
      ...previous,
      about: {
        ...previous.about,
        [field]: value,
      },
    }));
    clearMessages();
  }

  function updateRegistration(
    field: keyof RegistrationContent,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      registration: {
        ...previous.registration,
        [field]: value,
      },
    }));
    clearMessages();
  }

  function updateHowItWorks(
    field: keyof HowItWorksContent,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      how_it_works: {
        ...previous.how_it_works,
        [field]: value,
      },
    }));
    clearMessages();
  }

  function updateTestimonialHeading(
    field: "eyebrow" | "title",
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      testimonials: {
        ...previous.testimonials,
        [field]: value,
      },
    }));
    clearMessages();
  }

  function updateStatistic(
    index: number,
    field: "label" | "value",
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      statistics: previous.statistics.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "value"
                  ? value.trim() === ""
                    ? null
                    : Math.max(0, Number(value))
                  : value,
            }
          : item
      ),
    }));
    clearMessages();
  }

  function updateAboutValue(
    index: number,
    field: "title" | "text",
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      about: {
        ...previous.about,
        values: previous.about.values.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
    clearMessages();
  }

  function updateRegistrationStep(
    index: number,
    field: "title" | "text",
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
    clearMessages();
  }

  function updateHowItWorksStep(
    index: number,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      how_it_works: {
        ...previous.how_it_works,
        steps: previous.how_it_works.steps.map((item, i) =>
          i === index ? { ...item, title: value } : item
        ),
      },
    }));
    clearMessages();
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
    clearMessages();
  }

  function updateCredential(index: number, value: string) {
    setForm((previous) => ({
      ...previous,
      about: {
        ...previous.about,
        credentials: previous.about.credentials.map((item, i) =>
          i === index ? value : item
        ),
      },
    }));
    clearMessages();
  }

  function addCredential() {
    setForm((previous) => ({
      ...previous,
      about: {
        ...previous.about,
        credentials: [...previous.about.credentials, ""],
      },
    }));
    clearMessages();
  }

  function removeCredential(index: number) {
    setForm((previous) => ({
      ...previous,
      about: {
        ...previous.about,
        credentials: previous.about.credentials.filter(
          (_, i) => i !== index
        ),
      },
    }));
    clearMessages();
  }

  function clearMessages() {
    setNotice("");
    setValidationError("");
  }

  const saveMutation = useMutation({
    mutationFn: async (values: HomepageContent) => {
      const { error } = await supabase
        .from("homepage_content")
        .upsert(
          {
            id: 1,
            content: values,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        );

      if (error) throw error;
    },

    onSuccess: async (_, values) => {
      setOriginalForm(values);

      await queryClient.invalidateQueries({
        queryKey: ["homepage-content"],
      });

      setNotice("Homepage content saved successfully.");
    },
  });

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();

    if (!form.hero.title.trim()) {
      setValidationError("Please enter a hero heading.");
      return;
    }

    if (!form.hero.description.trim()) {
      setValidationError("Please enter a hero description.");
      return;
    }

    if (
      form.registration.steps.some(
        (step) => !step.title.trim() || !step.text.trim()
      )
    ) {
      setValidationError(
        "Please complete every registration step title and description."
      );
      return;
    }

    if (
      form.how_it_works.steps.some((step) => !step.title.trim())
    ) {
      setValidationError(
        "Please complete every How It Works step title."
      );
      return;
    }

    saveMutation.mutate(form);
  }

  function resetForm() {
    setForm(originalForm);
    clearMessages();
  }

  /* ------------------------------------------------------------------------ */
  /* Loading and error states                                                 */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* Editor UI                                                                */
  /* ------------------------------------------------------------------------ */

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
            Homepage Content
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage the text and content displayed across your homepage.
            Your existing website layout and design will remain unchanged.
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

      {/* Messages */}

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

      <form onSubmit={handleSave} className="space-y-6">
        {/* 01. HERO */}

        <EditorSection
          icon={Type}
          number="01"
          title="Hero Section"
          description="Manage the main banner visitors see when they first open your website."
        >
          <Field label="Eyebrow text">
            <TextInput
              value={form.hero.eyebrow}
              onChange={(value) => updateHero("eyebrow", value)}
            />
          </Field>

          <Field
            label="Main heading"
            hint="This is the main homepage headline."
          >
            <TextArea
              rows={3}
              value={form.hero.title}
              onChange={(value) => updateHero("title", value)}
            />
          </Field>

          <Field label="Description">
            <TextArea
              value={form.hero.description}
              onChange={(value) => updateHero("description", value)}
              rows={4}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Primary button text">
              <TextInput
                value={form.hero.primary_button}
                onChange={(value) =>
                  updateHero("primary_button", value)
                }
              />
            </Field>

            <Field label="Secondary button text">
              <TextInput
                value={form.hero.secondary_button}
                onChange={(value) =>
                  updateHero("secondary_button", value)
                }
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Serving label">
              <TextInput
                value={form.hero.serving_label}
                onChange={(value) =>
                  updateHero("serving_label", value)
                }
              />
            </Field>

            <Field label="Serving text">
              <TextInput
                value={form.hero.serving_text}
                onChange={(value) =>
                  updateHero("serving_text", value)
                }
              />
            </Field>
          </div>
        </EditorSection>

        {/* 02. STATISTICS */}

        <EditorSection
          icon={BarChart3}
          number="02"
          title="Professional Statistics"
          description="Edit the four statistic values and their labels. Only enter figures you can verify."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {form.statistics.map((statistic, index) => (
              <div
                key={statistic.id}
                className="space-y-4 rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#243653]">
                    Statistic {index + 1}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {statistic.id}
                  </span>
                </div>

                <Field label="Statistic value">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className={inputClass}
                    value={statistic.value ?? ""}
                    onChange={(event) =>
                      updateStatistic(
                        index,
                        "value",
                        event.target.value
                      )
                    }
                    placeholder="Leave empty if not verified"
                  />
                </Field>

                <Field label="Statistic label">
                  <TextInput
                    value={statistic.label}
                    onChange={(value) =>
                      updateStatistic(index, "label", value)
                    }
                  />
                </Field>
              </div>
            ))}
          </div>

          <p className="text-xs leading-5 text-slate-500">
            Empty statistic values will remain unpublished as figures.
            The existing statistic icons and animation are preserved.
          </p>
        </EditorSection>

        {/* 03. ABOUT */}

        <EditorSection
          icon={Building2}
          number="03"
          title="About Section"
          description="Manage your homepage introduction, mission, vision, credentials, and business values."
        >
          <Field label="Eyebrow text">
            <TextInput
              value={form.about.eyebrow}
              onChange={(value) => updateAbout("eyebrow", value)}
            />
          </Field>

          <Field label="Section heading">
            <TextInput
              value={form.about.title}
              onChange={(value) => updateAbout("title", value)}
            />
          </Field>

          <Field label="About description">
            <TextArea
              value={form.about.description}
              onChange={(value) =>
                updateAbout("description", value)
              }
              rows={5}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Mission label">
              <TextInput
                value={form.about.mission_label}
                onChange={(value) =>
                  updateAbout("mission_label", value)
                }
              />
            </Field>

            <Field label="Vision label">
              <TextInput
                value={form.about.vision_label}
                onChange={(value) =>
                  updateAbout("vision_label", value)
                }
              />
            </Field>

            <Field label="Mission statement">
              <TextArea
                value={form.about.mission}
                onChange={(value) =>
                  updateAbout("mission", value)
                }
                rows={3}
              />
            </Field>

            <Field label="Vision statement">
              <TextArea
                value={form.about.vision}
                onChange={(value) =>
                  updateAbout("vision", value)
                }
                rows={3}
              />
            </Field>
          </div>

          <Field label="About button text">
            <TextInput
              value={form.about.button_text}
              onChange={(value) =>
                updateAbout("button_text", value)
              }
            />
          </Field>

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div>
              <h3 className="font-bold text-[#243653]">
                Credentials and qualifications
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Add or remove the short credentials displayed below
                your About description.
              </p>
            </div>

            {form.about.credentials.map((credential, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className={inputClass}
                  value={credential}
                  onChange={(event) =>
                    updateCredential(index, event.target.value)
                  }
                  placeholder="Enter a verified qualification or credential"
                />

                <button
                  type="button"
                  onClick={() => removeCredential(index)}
                  className="shrink-0 rounded-xl border border-red-200 p-3 text-red-600 transition hover:bg-red-50"
                  aria-label="Remove credential"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addCredential}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-[#243653] hover:border-[#B7792B] hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Add Credential
            </button>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div>
              <h3 className="font-bold text-[#243653]">
                Business values
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Edit the four value cards displayed beside the About
                introduction.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {form.about.values.map((item, index) => (
                <div
                  key={item.id}
                  className="space-y-3 rounded-xl border border-slate-200 p-4"
                >
                  <h4 className="text-sm font-bold text-[#243653]">
                    Value card {index + 1}
                  </h4>

                  <Field label="Card title">
                    <TextInput
                      value={item.title}
                      onChange={(value) =>
                        updateAboutValue(index, "title", value)
                      }
                    />
                  </Field>

                  <Field label="Card description">
                    <TextArea
                      value={item.text}
                      onChange={(value) =>
                        updateAboutValue(index, "text", value)
                      }
                      rows={3}
                    />
                  </Field>
                </div>
              ))}
            </div>
          </div>
        </EditorSection>

        {/* 04. REGISTRATION */}

        <EditorSection
          icon={ClipboardList}
          number="04"
          title="Company Registration Process"
          description="Edit the registration section heading, its six steps, and the disclaimer."
        >
          <Field label="Eyebrow text">
            <TextInput
              value={form.registration.eyebrow}
              onChange={(value) =>
                updateRegistration("eyebrow", value)
              }
            />
          </Field>

          <Field label="Section heading">
            <TextInput
              value={form.registration.title}
              onChange={(value) =>
                updateRegistration("title", value)
              }
            />
          </Field>

          <Field label="Process link text">
            <TextInput
              value={form.registration.link_text}
              onChange={(value) =>
                updateRegistration("link_text", value)
              }
            />
          </Field>

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <h3 className="font-bold text-[#243653]">
              Registration steps
            </h3>

            {form.registration.steps.map((step, index) => (
              <div
                key={index}
                className="space-y-3 rounded-xl border border-slate-200 p-4"
              >
                <h4 className="text-sm font-bold text-[#B7792B]">
                  Step {String(index + 1).padStart(2, "0")}
                </h4>

                <Field label="Step title">
                  <TextInput
                    value={step.title}
                    onChange={(value) =>
                      updateRegistrationStep(index, "title", value)
                    }
                  />
                </Field>

                <Field label="Step description">
                  <TextArea
                    value={step.text}
                    onChange={(value) =>
                      updateRegistrationStep(index, "text", value)
                    }
                    rows={2}
                  />
                </Field>
              </div>
            ))}
          </div>

          <Field label="Registration disclaimer">
            <TextArea
              value={form.registration.disclaimer}
              onChange={(value) =>
                updateRegistration("disclaimer", value)
              }
              rows={3}
            />
          </Field>
        </EditorSection>

        {/* 05. HOW IT WORKS */}

        <EditorSection
          icon={Workflow}
          number="05"
          title="How It Works"
          description="Edit the seven steps that explain how clients work with your consultancy."
        >
          <Field label="Eyebrow text">
            <TextInput
              value={form.how_it_works.eyebrow}
              onChange={(value) =>
                updateHowItWorks("eyebrow", value)
              }
            />
          </Field>

          <Field label="Section heading">
            <TextInput
              value={form.how_it_works.title}
              onChange={(value) =>
                updateHowItWorks("title", value)
              }
            />
          </Field>

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <h3 className="font-bold text-[#243653]">
              Process steps
            </h3>

            {form.how_it_works.steps.map((step, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 p-4"
              >
                <h4 className="mb-3 text-sm font-bold text-[#B7792B]">
                  Step {index + 1}
                </h4>

                <Field label="Step title">
                  <TextInput
                    value={step.title}
                    onChange={(value) =>
                      updateHowItWorksStep(index, value)
                    }
                  />
                </Field>
              </div>
            ))}
          </div>

          <Field label="Process disclaimer">
            <TextArea
              value={form.how_it_works.disclaimer}
              onChange={(value) =>
                updateHowItWorks("disclaimer", value)
              }
              rows={3}
            />
          </Field>
        </EditorSection>

        {/* 06. TESTIMONIALS */}

        <EditorSection
          icon={MessageSquareQuote}
          number="06"
          title="Testimonials"
          description="Manage the client feedback displayed on your homepage. Only publish testimonials shared with permission."
        >
          <Field label="Eyebrow text">
            <TextInput
              value={form.testimonials.eyebrow}
              onChange={(value) =>
                updateTestimonialHeading("eyebrow", value)
              }
            />
          </Field>

          <Field label="Section heading">
            <TextInput
              value={form.testimonials.title}
              onChange={(value) =>
                updateTestimonialHeading("title", value)
              }
            />
          </Field>

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <h3 className="font-bold text-[#243653]">
              Client testimonials
            </h3>

            {form.testimonials.items.map((item, index) => (
              <div
                key={index}
                className="space-y-3 rounded-xl border border-slate-200 p-4"
              >
                <h4 className="text-sm font-bold text-[#B7792B]">
                  Testimonial {index + 1}
                </h4>

                <Field label="Client feedback">
                  <TextArea
                    value={item.quote}
                    onChange={(value) =>
                      updateTestimonial(index, "quote", value)
                    }
                    rows={4}
                    placeholder="Enter the client's feedback..."
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Client name">
                    <TextInput
                      value={item.client_name}
                      onChange={(value) =>
                        updateTestimonial(
                          index,
                          "client_name",
                          value
                        )
                      }
                      placeholder="Client name"
                    />
                  </Field>

                  <Field label="Service received">
                    <TextInput
                      value={item.service}
                      onChange={(value) =>
                        updateTestimonial(index, "service", value)
                      }
                      placeholder="e.g. Corporate Tax Consultancy"
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </EditorSection>

        {/* SAVE CONTROLS */}

        <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#243653]">
              {hasChanges ? "Unsaved changes" : "All changes saved"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {hasChanges
                ? "Save your changes to update your homepage content."
                : "Your homepage content is up to date."}
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
