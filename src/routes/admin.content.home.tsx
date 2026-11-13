
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
  Building2,
  Type,
  FileText,
  Eye,
  Save,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { siteDataQuery } from "@/lib/site-data";

export const Route = createFileRoute("/admin/content/home")({
  component: HomeContentPage,
});

type HomeSettings = {
  id: number;
  business_name: string | null;
  tagline: string | null;
  biography: string | null;
  updated_at: string | null;
};

type HomeForm = {
  business_name: string;
  tagline: string;
  biography: string;
};

const emptyForm: HomeForm = {
  business_name: "",
  tagline: "",
  biography: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10";

const textareaClass =
  "w-full min-h-32 resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10";

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
      {hint && <p className="text-xs leading-5 text-slate-500">{hint}</p>}
    </div>
  );
}

function HomeContentPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<HomeForm>(emptyForm);
  const [originalForm, setOriginalForm] = useState<HomeForm>(emptyForm);
  const [notice, setNotice] = useState("");
  const [validationError, setValidationError] = useState("");
  const [initialized, setInitialized] = useState(false);

  const settingsQuery = useQuery({
    queryKey: ["admin-home-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("id, business_name, tagline, biography, updated_at")
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          "The site settings record was not found. Please confirm that site_settings contains a row with id = 1."
        );
      }

      return data as HomeSettings;
    },
  });

  useEffect(() => {
    if (!settingsQuery.data || initialized) return;

    const loadedForm: HomeForm = {
      business_name: settingsQuery.data.business_name ?? "",
      tagline: settingsQuery.data.tagline ?? "",
      biography: settingsQuery.data.biography ?? "",
    };

    setForm(loadedForm);
    setOriginalForm(loadedForm);
    setInitialized(true);
  }, [settingsQuery.data, initialized]);

  const hasChanges =
    JSON.stringify(form) !== JSON.stringify(originalForm);

  function updateField<K extends keyof HomeForm>(
    field: K,
    value: HomeForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setNotice("");
    setValidationError("");
  }

  const saveMutation = useMutation({
    mutationFn: async (values: HomeForm) => {
      const payload = {
        business_name: values.business_name.trim(),
        tagline: values.tagline.trim(),
        biography: values.biography.trim(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("site_settings")
        .update(payload)
        .eq("id", 1)
        .select("id")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          "No settings record was updated. Check your Supabase permissions and confirm that the settings row exists."
        );
      }
    },

    onSuccess: async () => {
      setOriginalForm(form);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-home-content"],
        }),
        queryClient.invalidateQueries({
          queryKey: siteDataQuery.queryKey,
        }),
      ]);

      setNotice("Homepage content updated successfully.");
    },
  });

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setNotice("");
    setValidationError("");

    if (!form.business_name.trim()) {
      setValidationError("Please enter your business name.");
      return;
    }

    if (!form.tagline.trim()) {
      setValidationError("Please enter your homepage tagline.");
      return;
    }

    if (!form.biography.trim()) {
      setValidationError("Please enter your homepage introduction.");
      return;
    }

    saveMutation.mutate(form);
  }

  function resetForm() {
    setForm(originalForm);
    setValidationError("");
    setNotice("");
  }

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
          onClick={() => {
            setInitialized(false);
            settingsQuery.refetch();
          }}
          className="mt-4 rounded-lg bg-[#243653] px-4 py-2 text-sm font-semibold text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 pb-12">
      {/* Header */}
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
            Manage the main business identity, introductory message, and
            description displayed on your homepage.
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

      {/* Success message */}
      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {notice}
        </div>
      )}

      {/* Error message */}
      {(validationError || saveMutation.isError) && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {validationError || saveMutation.error?.message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business identity */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="rounded-xl bg-[#243653]/10 p-2.5 text-[#243653]">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-[#243653]">
                Business Identity
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Set the main business name displayed on your homepage.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <Field
              label="Business Name"
              hint="This is a shared business identity setting. Changes may also appear in other website sections."
            >
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  className={`${inputClass} pl-10`}
                  value={form.business_name}
                  onChange={(event) =>
                    updateField("business_name", event.target.value)
                  }
                  placeholder="Corporate Tax Bangladesh"
                  required
                />
              </div>
            </Field>
          </div>
        </section>

        {/* Homepage tagline */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="rounded-xl bg-[#243653]/10 p-2.5 text-[#243653]">
              <Type className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-[#243653]">
                Homepage Tagline
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Your main introductory statement or business message.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <Field
              label="Tagline"
              hint="Keep it concise, professional, and focused on the value your consultancy provides."
            >
              <textarea
                rows={3}
                className={textareaClass}
                value={form.tagline}
                onChange={(event) =>
                  updateField("tagline", event.target.value)
                }
                placeholder="Professional corporate tax solutions for your business..."
                required
              />
            </Field>
          </div>
        </section>

        {/* Homepage introduction */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="rounded-xl bg-[#243653]/10 p-2.5 text-[#243653]">
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-[#243653]">
                Homepage Introduction
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Edit the main introductory description used by your website.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <Field
              label="Introduction / Biography"
              hint="This field currently uses the existing biography column. Keep the text suitable for the homepage introduction."
            >
              <textarea
                rows={7}
                className={textareaClass}
                value={form.biography}
                onChange={(event) =>
                  updateField("biography", event.target.value)
                }
                placeholder="Introduce your consultancy, explain your approach, and tell visitors how you help businesses..."
                required
              />

              <div className="flex justify-end">
                <span className="text-xs text-slate-400">
                  {form.biography.length} characters
                </span>
              </div>
            </Field>
          </div>
        </section>

        {/* Preview */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="rounded-xl bg-[#B7792B]/10 p-2.5 text-[#B7792B]">
              <Eye className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-[#243653]">
                Homepage Content Preview
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Preview the text currently entered in the editor.
              </p>
            </div>
          </div>

          <div className="bg-[#243653] px-6 py-10 text-center sm:px-12 sm:py-14">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-[#E2B96F]">
              <Sparkles className="h-6 w-6" />
            </div>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#E2B96F]">
              {form.business_name || "Your Business Name"}
            </p>

            <h2 className="mx-auto max-w-3xl text-2xl font-bold leading-tight text-white sm:text-4xl">
              {form.tagline || "Your homepage tagline will appear here"}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-slate-200 sm:text-base">
              {form.biography ||
                "Your homepage introduction will appear here."}
            </p>

            <div className="mt-7 flex justify-center">
              <span className="rounded-lg border border-[#E2B96F]/50 px-5 py-2.5 text-sm font-semibold text-[#E2B96F]">
                Homepage content preview
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500">
            This is a text preview, not an exact replica of your live homepage
            layout.
          </div>
        </section>

        {/* Save controls */}
        <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#243653]">
              {hasChanges ? "Unsaved changes" : "All changes saved"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {hasChanges
                ? "Save your changes to update the website content."
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
