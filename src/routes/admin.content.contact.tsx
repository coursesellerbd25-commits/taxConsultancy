
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/content/contact")({
  component: ContactContentPage,
});

type ContactSettings = {
  id: number;
  business_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp_number: string | null;
  whatsapp_message: string | null;
  office_address: string | null;
  business_hours: string | null;
  updated_at: string | null;
};

type ContactForm = {
  business_name: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  whatsapp_message: string;
  office_address: string;
  business_hours: string;
};

const initialForm: ContactForm = {
  business_name: "",
  contact_email: "",
  contact_phone: "",
  whatsapp_number: "",
  whatsapp_message: "",
  office_address: "",
  business_hours: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10";

const textareaClass =
  "w-full min-h-28 resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
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

function ContactContentPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<ContactForm>(initialForm);
  const [originalForm, setOriginalForm] = useState<ContactForm>(initialForm);
  const [initialized, setInitialized] = useState(false);
  const [notice, setNotice] = useState("");
  const [validationError, setValidationError] = useState("");

  const settingsQuery = useQuery({
    queryKey: ["admin-contact-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select(
          "id, business_name, contact_email, contact_phone, whatsapp_number, whatsapp_message, office_address, business_hours, updated_at"
        )
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          "The site settings record was not found. Please check that the site_settings table contains a row with id = 1."
        );
      }

      return data as ContactSettings;
    },
  });

  // Populate the editor when the settings record is loaded.
  if (settingsQuery.data && !initialized) {
    const loadedForm: ContactForm = {
      business_name: settingsQuery.data.business_name ?? "",
      contact_email: settingsQuery.data.contact_email ?? "",
      contact_phone: settingsQuery.data.contact_phone ?? "",
      whatsapp_number: settingsQuery.data.whatsapp_number ?? "",
      whatsapp_message: settingsQuery.data.whatsapp_message ?? "",
      office_address: settingsQuery.data.office_address ?? "",
      business_hours: settingsQuery.data.business_hours ?? "",
    };

    setForm(loadedForm);
    setOriginalForm(loadedForm);
    setInitialized(true);
  }

  function updateField<K extends keyof ContactForm>(
    field: K,
    value: ContactForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setNotice("");
    setValidationError("");
  }

  const hasChanges =
    JSON.stringify(form) !== JSON.stringify(originalForm);

  const saveMutation = useMutation({
    mutationFn: async (values: ContactForm) => {
      const payload = {
        business_name: values.business_name.trim(),
        contact_email: values.contact_email.trim(),
        contact_phone: values.contact_phone.trim(),
        whatsapp_number: values.whatsapp_number.trim(),
        whatsapp_message: values.whatsapp_message.trim(),
        office_address: values.office_address.trim(),
        business_hours: values.business_hours.trim(),
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
          "No settings record was updated. Check your Supabase permissions and confirm that the row with id = 1 exists."
        );
      }
    },
    onSuccess: async () => {
      setOriginalForm(form);

      await queryClient.invalidateQueries({
        queryKey: ["admin-contact-content"],
      });

      // Refresh shared public website settings.
      await queryClient.invalidateQueries({
        queryKey: ["site-data"],
      });

      setNotice("Contact information updated successfully.");
    },
  });

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");
    setNotice("");

    if (
      form.contact_email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email.trim())
    ) {
      setValidationError("Please enter a valid contact email address.");
      return;
    }

    if (!hasChanges) {
      setNotice("There are no changes to save.");
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
          Loading contact information...
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
            Unable to load contact information
          </h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-red-600">
          {settingsQuery.error.message}
        </p>
        <button
          onClick={() => settingsQuery.refetch()}
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
            <MessageCircle className="h-4 w-4" />
            Website Content
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#243653] sm:text-3xl">
            Contact Information
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage the contact details displayed on your public website.
            Keep these details accurate so potential clients can reach your
            consultancy easily.
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#243653] transition hover:bg-slate-50"
        >
          <ExternalLink className="h-4 w-4" />
          View Website
        </a>
      </div>

      {/* Feedback */}
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
                The business name shown alongside your contact details.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <Field
              label="Business Name"
              hint="This field shares the business identity setting used elsewhere on the website."
            >
              <input
                className={inputClass}
                value={form.business_name}
                onChange={(event) =>
                  updateField("business_name", event.target.value)
                }
                placeholder="Corporate Tax Bangladesh"
              />
            </Field>
          </div>
        </section>

        {/* Contact channels */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="rounded-xl bg-[#243653]/10 p-2.5 text-[#243653]">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-[#243653]">
                Contact Channels
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Set the phone, email, and WhatsApp details clients can use.
              </p>
            </div>
          </div>

          <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-7">
            <Field label="Contact Email" hint="Example: info@example.com">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  className={`${inputClass} pl-10`}
                  value={form.contact_email}
                  onChange={(event) =>
                    updateField("contact_email", event.target.value)
                  }
                  placeholder="info@example.com"
                />
              </div>
            </Field>

            <Field label="Contact Phone" hint="Include the country code.">
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  className={`${inputClass} pl-10`}
                  value={form.contact_phone}
                  onChange={(event) =>
                    updateField("contact_phone", event.target.value)
                  }
                  placeholder="+880 1XXXXXXXXX"
                />
              </div>
            </Field>

            <div className="sm:col-span-2">
              <Field
                label="WhatsApp Number"
                hint="Use the international format. For WhatsApp links, digits are typically used without spaces or the + sign."
              >
                <div className="relative">
                  <MessageCircle className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    className={`${inputClass} pl-10`}
                    value={form.whatsapp_number}
                    onChange={(event) =>
                      updateField("whatsapp_number", event.target.value)
                    }
                    placeholder="8801XXXXXXXXX"
                  />
                </div>
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field
                label="Default WhatsApp Message"
                hint="The message visitors see when they open your WhatsApp contact link."
              >
                <textarea
                  rows={3}
                  className={textareaClass}
                  value={form.whatsapp_message}
                  onChange={(event) =>
                    updateField("whatsapp_message", event.target.value)
                  }
                  placeholder="Hello, I would like to know more about your tax consultancy services."
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Location and hours */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="rounded-xl bg-[#243653]/10 p-2.5 text-[#243653]">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-[#243653]">
                Office & Availability
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Tell visitors where your office is and when you are available.
              </p>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-7">
            <Field
              label="Office Address"
              hint="Enter the complete address as you want it displayed publicly."
            >
              <div className="relative">
                <MapPin className="absolute left-3.5 top-4 h-4 w-4 text-slate-400" />
                <textarea
                  rows={3}
                  className={`${textareaClass} pl-10`}
                  value={form.office_address}
                  onChange={(event) =>
                    updateField("office_address", event.target.value)
                  }
                  placeholder="Office address, area, city, Bangladesh"
                />
              </div>
            </Field>

            <Field
              label="Business Hours"
              hint="Enter the schedule in the format you want visitors to see. Use separate lines for different days if needed."
            >
              <div className="relative">
                <Clock className="absolute left-3.5 top-4 h-4 w-4 text-slate-400" />
                <textarea
                  rows={4}
                  className={`${textareaClass} pl-10`}
                  value={form.business_hours}
                  onChange={(event) =>
                    updateField("business_hours", event.target.value)
                  }
                  placeholder={
                    "Saturday - Thursday: 9:00 AM - 6:00 PM\nFriday: Closed"
                  }
                />
              </div>
            </Field>
          </div>
        </section>

        {/* Preview */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
            <h2 className="font-bold text-[#243653]">
              Contact Information Preview
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              A quick preview of the information currently entered above.
            </p>
          </div>

          <div className="grid gap-4 bg-slate-50/70 p-5 sm:grid-cols-2 sm:p-7">
            <PreviewItem
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={form.contact_email}
            />
            <PreviewItem
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value={form.contact_phone}
            />
            <PreviewItem
              icon={<MessageCircle className="h-4 w-4" />}
              label="WhatsApp"
              value={form.whatsapp_number}
            />
            <PreviewItem
              icon={<MapPin className="h-4 w-4" />}
              label="Office Address"
              value={form.office_address}
            />
            <div className="sm:col-span-2">
              <PreviewItem
                icon={<Clock className="h-4 w-4" />}
                label="Business Hours"
                value={form.business_hours}
              />
            </div>
          </div>
        </section>

        {/* Save controls */}
        <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-semibold text-[#243653]">
              {hasChanges ? "Unsaved changes" : "All changes saved"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {hasChanges
                ? "Save your changes to update the website."
                : "Your contact information is up to date."}
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

function PreviewItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#243653]/10 text-[#243653]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-[#243653]">
          {value.trim() || "Not provided"}
        </p>
      </div>
    </div>
  );
}
