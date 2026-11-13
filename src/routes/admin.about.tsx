
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  UserRound,
  Building2,
  Save,
  Loader2,
  RefreshCw,
  Eye,
  AlignLeft,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { siteDataQuery } from "@/lib/site-data";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/about")({
  component: AdminAboutPage,
});

type AboutForm = {
  tagline: string;
  consultant_name: string;
  biography: string;
};

const initialForm: AboutForm = {
  tagline: "",
  consultant_name: "",
  biography: "",
};

const inputClass =
  "h-11 rounded-lg border-slate-200 bg-white text-sm shadow-none focus-visible:ring-[#B7792B]/30";

const textareaClass =
  "min-h-[180px] resize-y rounded-lg border-slate-200 bg-white text-sm leading-relaxed shadow-none focus-visible:ring-[#B7792B]/30";

function AdminAboutPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<AboutForm>(initialForm);
  const [hasChanges, setHasChanges] = useState(false);

  const aboutQuery = useQuery({
    queryKey: ["admin-about"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("id, tagline, consultant_name, biography")
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;

      return data;
    },
  });

  useEffect(() => {
    if (!aboutQuery.data) return;

    setForm({
      tagline: aboutQuery.data.tagline ?? "",
      consultant_name: aboutQuery.data.consultant_name ?? "",
      biography: aboutQuery.data.biography ?? "",
    });

    setHasChanges(false);
  }, [aboutQuery.data]);

  const updateField = (field: keyof AboutForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setHasChanges(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .update({
          tagline: form.tagline.trim() || null,
          consultant_name: form.consultant_name.trim() || null,
          biography: form.biography.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1)
        .select("id")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          "The website settings record was not found. Please check that site_settings contains a row with id = 1.",
        );
      }
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-about"],
        }),
        queryClient.invalidateQueries({
          queryKey: siteDataQuery.queryKey,
        }),
      ]);

      setHasChanges(false);
      toast.success("About section updated successfully.");
    },

    onError: (error) => {
      toast.error(error.message || "Unable to save About section.");
    },
  });

  const handleReset = () => {
    if (aboutQuery.data) {
      setForm({
        tagline: aboutQuery.data.tagline ?? "",
        consultant_name: aboutQuery.data.consultant_name ?? "",
        biography: aboutQuery.data.biography ?? "",
      });
    } else {
      setForm(initialForm);
    }

    setHasChanges(false);
  };

  if (aboutQuery.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 size={20} className="animate-spin" />
          Loading About section...
        </div>
      </div>
    );
  }

  if (aboutQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Could not load About section
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {aboutQuery.error.message}
        </p>

        <Button
          variant="outline"
          onClick={() => aboutQuery.refetch()}
          className="mt-4 border-red-200 bg-white text-red-700 hover:bg-red-100"
        >
          <RefreshCw size={15} className="mr-2" />
          Try again
        </Button>
      </div>
    );
  }

  if (!aboutQuery.data) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-semibold text-amber-900">
          Website settings record not found
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-amber-800">
          This page uses the existing site_settings record with id = 1. Create
          or restore that record before editing the About section.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#B7792B]">
            <FileText size={14} />
            Website content
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#243653] sm:text-3xl">
            About the Consultancy
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Manage the introduction and business information displayed in the
            public About section of Corporate Tax Bangladesh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || saveMutation.isPending}
            className="h-10 border-slate-200 text-slate-600"
          >
            Discard
          </Button>

          <Button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={!hasChanges || saveMutation.isPending}
            className="h-10 bg-[#243653] px-5 text-white hover:bg-[#1b2940]"
          >
            {saveMutation.isPending ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            Save changes
          </Button>
        </div>
      </div>

      {/* Information banner */}
      <div className="flex items-start gap-3 rounded-xl border border-[#B7792B]/20 bg-[#B7792B]/[0.06] p-4">
        <Building2 size={19} className="mt-0.5 shrink-0 text-[#B7792B]" />

        <div>
          <h2 className="text-sm font-semibold text-[#243653]">
            About section content
          </h2>

          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Changes saved here update the existing website settings record.
            Your public website can display the updated biography through its
            shared site data.
          </p>
        </div>
      </div>

      {/* Editor and preview */}
      <div className="grid items-start gap-6 xl:grid-cols-[1fr_0.85fr]">
        {/* Editor */}
        <div className="space-y-6">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#243653]/[0.07] text-[#243653]">
                <AlignLeft size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-[#243653]">
                  About information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Edit the introduction and description of your consultancy.
                </p>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="space-y-2">
                <Label
                  htmlFor="about-tagline"
                  className="text-sm font-medium text-slate-700"
                >
                  About heading / tagline
                </Label>

                <Input
                  id="about-tagline"
                  value={form.tagline}
                  onChange={(event) =>
                    updateField("tagline", event.target.value)
                  }
                  placeholder="Professional Tax Consultancy Services"
                  maxLength={160}
                  className={inputClass}
                />

                <p className="text-xs text-slate-400">
                  A short statement that introduces your business.
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="about-consultant"
                  className="text-sm font-medium text-slate-700"
                >
                  Consultant / representative name
                </Label>

                <div className="relative">
                  <UserRound
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    id="about-consultant"
                    value={form.consultant_name}
                    onChange={(event) =>
                      updateField("consultant_name", event.target.value)
                    }
                    placeholder="Enter consultant or representative name"
                    maxLength={120}
                    className={`${inputClass} pl-9`}
                  />
                </div>

                <p className="text-xs text-slate-400">
                  The person associated with your consultancy.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label
                    htmlFor="about-biography"
                    className="text-sm font-medium text-slate-700"
                  >
                    Business biography
                  </Label>

                  <span className="text-xs text-slate-400">
                    {form.biography.length.toLocaleString()} / 4,000
                  </span>
                </div>

                <Textarea
                  id="about-biography"
                  value={form.biography}
                  onChange={(event) =>
                    updateField("biography", event.target.value)
                  }
                  placeholder="Introduce your consultancy, explain your experience, describe your approach and tell visitors how you help clients..."
                  maxLength={4000}
                  className={textareaClass}
                />

                <p className="text-xs leading-relaxed text-slate-400">
                  Write a clear and professional introduction. This
                  information is intended for public visitors, not internal
                  administrator notes.
                </p>
              </div>
            </div>
          </section>

          {/* Save information */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm">
              {hasChanges ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="font-medium text-amber-700">
                    Unsaved changes
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span className="text-slate-500">
                    All changes are saved
                  </span>
                </>
              )}
            </div>

            <Button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={!hasChanges || saveMutation.isPending}
              className="bg-[#243653] text-white hover:bg-[#1b2940]"
            >
              {saveMutation.isPending ? (
                <Loader2 size={15} className="mr-2 animate-spin" />
              ) : (
                <Save size={15} className="mr-2" />
              )}
              Save About content
            </Button>
          </div>
        </div>

        {/* Live preview */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-6">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#B7792B]/10 text-[#B7792B]">
              <Eye size={17} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-[#243653]">
                Content preview
              </h2>
              <p className="text-xs text-slate-500">
                Preview of the information being edited
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="rounded-xl bg-[#243653] p-5 text-white sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D9AD6A]">
                About us
              </p>

              <h3 className="mt-3 text-xl font-bold leading-snug">
                {form.tagline.trim() || "Your business introduction"}
              </h3>

              <div className="mt-5 h-1 w-12 rounded-full bg-[#B7792B]" />

              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-200">
                {form.biography.trim() ||
                  "Your consultancy biography will appear here once you add your business introduction."}
              </p>

              {form.consultant_name.trim() && (
                <div className="mt-6 border-t border-white/15 pt-4">
                  <p className="text-xs text-slate-300">
                    Consultant / Representative
                  </p>

                  <p className="mt-1 font-semibold text-white">
                    {form.consultant_name}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3">
              <Eye size={15} className="mt-0.5 shrink-0 text-slate-400" />

              <p className="text-xs leading-relaxed text-slate-500">
                This is an editor preview, not an exact screenshot of your
                public About page. The final layout depends on the components
                in your existing public About route.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
