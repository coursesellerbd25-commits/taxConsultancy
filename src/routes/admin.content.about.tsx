
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Save,
  LoaderCircle,
  Info,
  Image as ImageIcon,
  UserRound,
  GraduationCap,
  BriefcaseBusiness,
  Award,
  BookOpen,
  Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/content/about")({
  component: AboutContentPage,
});

type AboutSettings = {
  business_name: string;
  consultant_name: string;
  about_eyebrow: string;
  about_intro: string;
  consultant_photo_url: string;
  biography: string;
  credentials: string;
  professional_experience: string;
  specializations: string;
  professional_approach: string;
  affiliations: string;
};

const initialSettings: AboutSettings = {
  business_name: "",
  consultant_name: "",
  about_eyebrow: "About",
  about_intro: "",
  consultant_photo_url: "",
  biography: "",
  credentials: "",
  professional_experience: "",
  specializations: "",
  professional_approach: "",
  affiliations: "",
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10"
      />
      {hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-lg bg-[#243653]/5 p-2.5 text-[#243653]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#243653]">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function AboutContentPage() {
  const [settings, setSettings] =
    useState<AboutSettings>(initialSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data) {
      const row = data as unknown as Partial<AboutSettings>;

      setSettings({
        business_name: row.business_name ?? "",
        consultant_name: row.consultant_name ?? "",
        about_eyebrow: row.about_eyebrow ?? "About",
        about_intro: row.about_intro ?? "",
        consultant_photo_url: row.consultant_photo_url ?? "",
        biography: row.biography ?? "",
        credentials: Array.isArray(row.credentials) ? row.credentials.join("\n") : row.credentials ?? "",
        professional_experience: row.professional_experience ?? "",
        specializations: Array.isArray(row.specializations) ? row.specializations.join("\n") : row.specializations ?? "",
        professional_approach: row.professional_approach ?? "",
        affiliations: Array.isArray(row.affiliations) ? row.affiliations.join("\n") : row.affiliations ?? "",
      });
    }

    setLoading(false);
  }

  function updateField<K extends keyof AboutSettings>(
    field: K,
    value: AboutSettings[K],
  ) {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));

    setMessage("");
    setError("");
  }

  async function handlePhotoUpload(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file = event.target.files?.[0];

  if (!file) return;

  setMessage("");
  setError("");

  // Only PNG files are accepted
  if (file.type !== "image/png") {
    setError("Please select a PNG image.");
    event.target.value = "";
    return;
  }

  // Maximum file size: 5 MB
  if (file.size > 5 * 1024 * 1024) {
    setError("Image size must be 5 MB or less.");
    event.target.value = "";
    return;
  }

  setUploading(true);

  try {
    const filePath = `about/consultant-${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from("site-images")
      .upload(filePath, file, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("site-images")
      .getPublicUrl(filePath);

    updateField("consultant_photo_url", data.publicUrl);

    setMessage("Photograph uploaded successfully. Click Save Changes to publish it.");
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to upload photograph."
    );
  } finally {
    setUploading(false);
    event.target.value = "";
  }
}

  async function handleSave() {
    setSaving(true);
    setMessage("");
    setError("");

    const { error } = await supabase
      .from("site_settings")
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

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
            Manage the consultant profile, biography, qualifications,
            experience and professional information shown on your website.
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

      {/* Basic information */}
      <SectionCard
        icon={UserRound}
        title="About Page Introduction"
        description="Control the heading and introductory text visitors see at the top of the About page."
      >
        <Field
          label="Business Name"
          value={settings.business_name}
          onChange={(value) => updateField("business_name", value)}
          placeholder="Corporate Tax Bangladesh"
        />

        <Field
          label="Section Label / Eyebrow"
          value={settings.about_eyebrow}
          onChange={(value) => updateField("about_eyebrow", value)}
          placeholder="About"
        />

        <Field
          label="Consultant / Founder Name"
          value={settings.consultant_name}
          onChange={(value) => updateField("consultant_name", value)}
          placeholder="Enter consultant's name"
        />

        <TextAreaField
          label="Page Introduction"
          value={settings.about_intro}
          onChange={(value) => updateField("about_intro", value)}
          placeholder="A tax practitioner and VAT consultant serving individuals and businesses in Bangladesh."
          rows={3}
        />
      </SectionCard>

      
      {/* Consultant photo */}
      <SectionCard
        icon={ImageIcon}
        title="Professional Photograph"
        description="Upload the consultant's professional PNG photograph displayed on the public About page."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Upload Consultant Photograph
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-[#243653] hover:bg-slate-100">
              {uploading ? (
                <>
                  <LoaderCircle className="mb-3 h-9 w-9 animate-spin text-[#243653]" />
                  <span className="text-sm font-semibold text-[#243653]">
                    Uploading photograph...
                  </span>
                </>
              ) : (
                <>
                  <ImageIcon className="mb-3 h-9 w-9 text-slate-400" />
                  <span className="text-sm font-semibold text-[#243653]">
                    Click to upload PNG photograph
                  </span>
                  <span className="mt-2 text-xs text-slate-500">
                    PNG format only · Maximum file size: 5 MB
                  </span>
                </>
              )}

              <input
                type="file"
                accept="image/png,.png"
                disabled={uploading}
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          {settings.consultant_photo_url && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Photograph Preview
                </p>

                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                  Uploaded
                </span>
              </div>

              <img
                src={settings.consultant_photo_url}
                alt="Consultant photograph preview"
                className="aspect-[4/5] w-48 rounded-lg border border-slate-200 bg-slate-50 object-cover"
              />

              <button
                type="button"
                onClick={() =>
                  updateField("consultant_photo_url", "")
                }
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Remove photograph
              </button>

              <p className="mt-3 break-all text-xs text-slate-400">
                {settings.consultant_photo_url}
              </p>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Biography */}
      <SectionCard
        icon={BookOpen}
        title="Professional Biography"
        description="Write the main biography displayed in the Professional Biography section."
      >
        <TextAreaField
          label="Biography"
          value={settings.biography}
          onChange={(value) => updateField("biography", value)}
          placeholder="Write the consultant's professional background, expertise, working experience and commitment to clients..."
          rows={9}
        />
      </SectionCard>

      {/* Qualifications */}
      <SectionCard
        icon={GraduationCap}
        title="Qualifications & Certifications"
        description="Add verified academic qualifications, professional certifications and memberships."
      >
        <TextAreaField
          label="Qualifications & Certifications"
          value={settings.credentials}
          onChange={(value) => updateField("credentials", value)}
          placeholder={"Bachelor's Degree in ...\nProfessional Certification in ..."}
          rows={6}
          hint="Enter each qualification on a separate line. Empty lines are ignored."
        />
      </SectionCard>

      {/* Experience */}
      <SectionCard
        icon={BriefcaseBusiness}
        title="Professional Experience"
        description="Describe the consultant's relevant work history and professional experience."
      >
        <TextAreaField
          label="Experience Details"
          value={settings.professional_experience}
          onChange={(value) =>
            updateField("professional_experience", value)
          }
          placeholder="Describe relevant roles, years of experience, client work and areas of responsibility..."
          rows={7}
        />
      </SectionCard>

      {/* Specializations */}
      <SectionCard
        icon={Award}
        title="Areas of Specialization"
        description="Manage the list of services and practice areas displayed on the About page."
      >
        <TextAreaField
          label="Specializations (one item per line)"
          value={settings.specializations}
          onChange={(value) => updateField("specializations", value)}
          placeholder={"Income Tax Consultancy\nVAT Compliance\nCompany Registration\nCorporate Tax Advisory"}
          rows={7}
          hint="Each line becomes a separate specialization."
        />
      </SectionCard>

      {/* Professional approach */}
      <SectionCard
        icon={Eye}
        title="Professional Approach"
        description="Explain how the consultant works with clients and approaches professional responsibilities."
      >
        <TextAreaField
          label="Professional Approach"
          value={settings.professional_approach}
          onChange={(value) =>
            updateField("professional_approach", value)
          }
          placeholder="Explain your approach to consultations, communication, documentation, confidentiality and client support..."
          rows={7}
        />
      </SectionCard>

      {/* Affiliations */}
      <SectionCard
        icon={GraduationCap}
        title="Professional Affiliations"
        description="List verified professional memberships, affiliations and relevant organizations."
      >
        <TextAreaField
          label="Affiliations (one item per line)"
          value={settings.affiliations}
          onChange={(value) => updateField("affiliations", value)
          }
          placeholder={"Professional organization or association\nVerified membership"}
          rows={5}
          hint="Only add affiliations that can be verified."
        />
      </SectionCard>

      {/* Information */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div>
          <p className="text-sm font-semibold text-blue-900">
            About page content management
          </p>
          <p className="mt-1 text-sm leading-6 text-blue-800">
            All these fields are saved in the site_settings table.
            Your public About page must read these same fields to show
            the latest content. Saving here does not automatically
            change the public page until that page is connected to them.
          </p>
        </div>
      </div>

      {/* Bottom save */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#30476b] disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save About Page"}
        </button>
      </div>
    </div>
  );
}
