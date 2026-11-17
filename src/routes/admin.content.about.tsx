
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, LoaderCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/content/about")({
  component: AboutContentPage,
});

type AboutSettings = {
  business_name: string;
  tagline: string;
  consultant_name: string;
  biography: string;
  logo_url: string;
};

const initialSettings: AboutSettings = {
  business_name: "",
  tagline: "",
  consultant_name: "",
  biography: "",
  logo_url: "",
};

function AboutContentPage() {
  const [settings, setSettings] =
    useState<AboutSettings>(initialSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "business_name, tagline, consultant_name, biography, logo_url"
      )
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data) {
      setSettings({
        business_name: data.business_name ?? "",
        tagline: data.tagline ?? "",
        consultant_name: data.consultant_name ?? "",
        biography: data.biography ?? "",
        logo_url: data.logo_url ?? "",
      });
    }

    setLoading(false);
  }

  function updateField(
    field: keyof AboutSettings,
    value: string
  ) {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
    setMessage("");
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    setError("");

    const { error } = await supabase
      .from("site_settings")
      .upsert(
        {
          id: 1,
          ...settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      setError(error.message);
    } else {
      setMessage("About page content saved successfully.");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <LoaderCircle className="h-7 w-7 animate-spin text-[#243653]" />
        <span className="ml-3 text-sm text-slate-500">
          Loading About page content...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-7 pb-10">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#B7792B]">
            Website Content / About
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#243653]">
            About Page Editor
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage the business introduction and consultant information
            displayed on your public website.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#30476b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Feedback */}
      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">Could not save or load content</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={loadSettings}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Business information */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#243653]">
            Business Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Basic information displayed in the About section.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Business Name
            </label>
            <input
              type="text"
              value={settings.business_name}
              onChange={(e) =>
                updateField("business_name", e.target.value)
              }
              placeholder="Corporate Tax Bangladesh"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tagline
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) =>
                updateField("tagline", e.target.value)
              }
              placeholder="Your trusted tax consultancy partner"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Consultant / Founder Name
            </label>
            <input
              type="text"
              value={settings.consultant_name}
              onChange={(e) =>
                updateField("consultant_name", e.target.value)
              }
              placeholder="Enter consultant's name"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Business Logo URL
            </label>
            <input
              type="url"
              value={settings.logo_url}
              onChange={(e) =>
                updateField("logo_url", e.target.value)
              }
              placeholder="https://example.com/logo.png"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10"
            />

            {settings.logo_url && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-xs font-medium text-slate-500">
                  Logo Preview
                </p>
                <img
                  src={settings.logo_url}
                  alt="Business logo preview"
                  className="h-16 max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About biography */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#243653]">
            About the Business
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Write the introduction that visitors will see on your About page.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Business Biography / Introduction
          </label>
          <textarea
            rows={10}
            value={settings.biography}
            onChange={(e) =>
              updateField("biography", e.target.value)
            }
            placeholder="Write about your consultancy, experience, expertise, mission, and the services you provide..."
            className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10"
          />
          <p className="mt-2 text-xs text-slate-400">
            This content is stored in your website settings.
          </p>
        </div>
      </section>

      {/* Information notice */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div>
          <p className="text-sm font-semibold text-blue-900">
            Content management information
          </p>
          <p className="mt-1 text-sm leading-6 text-blue-800">
            Changes are saved to Supabase. Your public About page must
            read these same fields from site_settings to display the
            updated information.
          </p>
        </div>
      </div>

      {/* Bottom save button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#30476b] disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save About Page"}
        </button>
      </div>
    </div>
  );
}
