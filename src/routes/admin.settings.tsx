
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Building2,
  Clock3,
  Mail,
  MessageCircle,
  Phone,
  Save,
  UserRound,
  MapPin,
  FileText,
  Loader2,
  Settings2,
  RefreshCw,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { siteDataQuery } from "@/lib/site-data";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

type SettingsForm = {
  business_name: string;
  tagline: string;
  consultant_name: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  whatsapp_message: string;
  office_address: string;
  business_hours: string;
  biography: string;
};

const initialForm: SettingsForm = {
  business_name: "",
  tagline: "",
  consultant_name: "",
  contact_email: "",
  contact_phone: "",
  whatsapp_number: "",
  whatsapp_message: "",
  office_address: "",
  business_hours: "",
  biography: "",
};

const inputClass =
  "h-11 rounded-lg border-slate-200 bg-white text-sm shadow-none focus-visible:ring-[#B7792B]/30";

const textareaClass =
  "min-h-[110px] resize-y rounded-lg border-slate-200 bg-white text-sm shadow-none focus-visible:ring-[#B7792B]/30";

function SettingsSection({
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
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#243653]/[0.07] text-[#243653]">
          <Icon size={19} />
        </div>

        <div>
          <h2 className="font-semibold text-[#243653]">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </section>
  );
}

function FormField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-slate-500">{hint}</p>}
    </div>
  );
}

function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SettingsForm>(initialForm);
  const [hasChanges, setHasChanges] = useState(false);

  const settingsQuery = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!settingsQuery.data) return;

    setForm({
      business_name: settingsQuery.data.business_name ?? "",
      tagline: settingsQuery.data.tagline ?? "",
      consultant_name: settingsQuery.data.consultant_name ?? "",
      contact_email: settingsQuery.data.contact_email ?? "",
      contact_phone: settingsQuery.data.contact_phone ?? "",
      whatsapp_number: settingsQuery.data.whatsapp_number ?? "",
      whatsapp_message: settingsQuery.data.whatsapp_message ?? "",
      office_address: settingsQuery.data.office_address ?? "",
      business_hours: settingsQuery.data.business_hours ?? "",
      biography: settingsQuery.data.biography ?? "",
    });

    setHasChanges(false);
  }, [settingsQuery.data]);

  const updateField = (field: keyof SettingsForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setHasChanges(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const email = form.contact_email.trim();
      const whatsapp = form.whatsapp_number.replace(/\D/g, "");

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Please enter a valid contact email address.");
      }

      if (whatsapp && (whatsapp.length < 8 || whatsapp.length > 15)) {
        throw new Error("WhatsApp number must contain 8–15 digits.");
      }

      const payload = {
        id: 1,
        business_name: form.business_name.trim() || null,
        tagline: form.tagline.trim() || null,
        consultant_name: form.consultant_name.trim() || null,
        contact_email: email || null,
        contact_phone: form.contact_phone.trim() || null,
        whatsapp_number: whatsapp || null,
        whatsapp_message: form.whatsapp_message.trim() || null,
        office_address: form.office_address.trim() || null,
        business_hours: form.business_hours.trim() || null,
        biography: form.biography.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("site_settings")
        .upsert(payload, { onConflict: "id" });

      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-settings"] }),
        queryClient.invalidateQueries({ queryKey: siteDataQuery.queryKey }),
      ]);

      setHasChanges(false);
      toast.success("Website settings saved successfully.");
    },
    onError: (error) => {
      toast.error(error.message || "Unable to save website settings.");
    },
  });

  const handleReset = () => {
    if (settingsQuery.data) {
      setForm({
        business_name: settingsQuery.data.business_name ?? "",
        tagline: settingsQuery.data.tagline ?? "",
        consultant_name: settingsQuery.data.consultant_name ?? "",
        contact_email: settingsQuery.data.contact_email ?? "",
        contact_phone: settingsQuery.data.contact_phone ?? "",
        whatsapp_number: settingsQuery.data.whatsapp_number ?? "",
        whatsapp_message: settingsQuery.data.whatsapp_message ?? "",
        office_address: settingsQuery.data.office_address ?? "",
        business_hours: settingsQuery.data.business_hours ?? "",
        biography: settingsQuery.data.biography ?? "",
      });
    } else {
      setForm(initialForm);
    }

    setHasChanges(false);
  };

  if (settingsQuery.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="animate-spin" size={20} />
          Loading website settings...
        </div>
      </div>
    );
  }

  if (settingsQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Could not load website settings
        </h2>
        <p className="mt-2 text-sm text-red-700">
          {settingsQuery.error.message}
        </p>
        <Button
          variant="outline"
          className="mt-4 border-red-200 bg-white text-red-700 hover:bg-red-100"
          onClick={() => settingsQuery.refetch()}
        >
          <RefreshCw size={15} className="mr-2" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#B7792B]">
            <Settings2 size={14} />
            Administration
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#243653] sm:text-3xl">
            Website Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Manage your business identity, contact details and public-facing
            information displayed across Corporate Tax Bangladesh.
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
            Discard changes
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

      {/* Status information */}
      <div className="flex flex-col justify-between gap-2 rounded-xl border border-[#B7792B]/20 bg-[#B7792B]/[0.06] px-4 py-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm text-[#243653]">
          <Building2 size={17} className="shrink-0 text-[#B7792B]" />
          <span>
            These details are used by your public website and customer
            communication channels.
          </span>
        </div>

        <span className="text-xs font-medium text-slate-500">
          Settings record: #1
        </span>
      </div>

      {/* Business identity */}
      <SettingsSection
        icon={Building2}
        title="Business identity"
        description="Control how your consultancy is introduced to website visitors."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            label="Business name"
            htmlFor="business_name"
            hint="The main name displayed in your website header and business information."
          >
            <Input
              id="business_name"
              value={form.business_name}
              onChange={(e) => updateField("business_name", e.target.value)}
              placeholder="Corporate Tax Bangladesh"
              maxLength={120}
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Tagline"
            htmlFor="tagline"
            hint="A short description that communicates your business value."
          >
            <Input
              id="tagline"
              value={form.tagline}
              onChange={(e) => updateField("tagline", e.target.value)}
              placeholder="Professional Tax Consultancy Services"
              maxLength={120}
              className={inputClass}
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField
              label="Consultant / business representative"
              htmlFor="consultant_name"
              hint="The name associated with your consultancy or public business profile."
            >
              <Input
                id="consultant_name"
                value={form.consultant_name}
                onChange={(e) => updateField("consultant_name", e.target.value)}
                placeholder="Enter consultant name"
                maxLength={120}
                className={inputClass}
              />
            </FormField>
          </div>
        </div>
      </SettingsSection>

      {/* Contact information */}
      <SettingsSection
        icon={Phone}
        title="Contact information"
        description="Keep your customer communication channels accurate and accessible."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            label="Business email"
            htmlFor="contact_email"
            hint="Customers may use this address to contact your consultancy."
          >
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                id="contact_email"
                type="email"
                value={form.contact_email}
                onChange={(e) => updateField("contact_email", e.target.value)}
                placeholder="info@example.com"
                maxLength={255}
                className={`${inputClass} pl-9`}
              />
            </div>
          </FormField>

          <FormField
            label="Contact phone"
            htmlFor="contact_phone"
            hint="Include the country code where appropriate."
          >
            <div className="relative">
              <Phone
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                id="contact_phone"
                value={form.contact_phone}
                onChange={(e) => updateField("contact_phone", e.target.value)}
                placeholder="+880 1XXXXXXXXX"
                maxLength={30}
                className={`${inputClass} pl-9`}
              />
            </div>
          </FormField>

          <FormField
            label="WhatsApp number"
            htmlFor="whatsapp_number"
            hint="Enter the country code and number. Spaces and symbols are removed when saving."
          >
            <div className="relative">
              <MessageCircle
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                id="whatsapp_number"
                value={form.whatsapp_number}
                onChange={(e) => updateField("whatsapp_number", e.target.value)}
                placeholder="8801XXXXXXXXX"
                maxLength={25}
                className={`${inputClass} pl-9`}
              />
            </div>
          </FormField>

          <FormField
            label="Default WhatsApp message"
            htmlFor="whatsapp_message"
            hint="This message can appear when a visitor starts a WhatsApp conversation."
          >
            <Input
              id="whatsapp_message"
              value={form.whatsapp_message}
              onChange={(e) =>
                updateField("whatsapp_message", e.target.value)
              }
              placeholder="Hello, I would like to know more about your services."
              maxLength={300}
              className={inputClass}
            />
          </FormField>
        </div>
      </SettingsSection>

      {/* Office information */}
      <SettingsSection
        icon={MapPin}
        title="Office information"
        description="Provide visitors with your office location and availability."
      >
        <FormField
          label="Office address"
          htmlFor="office_address"
          hint="Use the complete address you want displayed on your website."
        >
          <Textarea
            id="office_address"
            value={form.office_address}
            onChange={(e) => updateField("office_address", e.target.value)}
            placeholder="Enter your office address..."
            maxLength={300}
            className={textareaClass}
          />
        </FormField>

        <FormField
          label="Business hours"
          htmlFor="business_hours"
          hint="For example: Saturday – Thursday, 9:00 AM – 6:00 PM."
        >
          <div className="relative">
            <Clock3
              size={16}
              className="absolute left-3 top-3.5 text-slate-400"
            />
            <Textarea
              id="business_hours"
              value={form.business_hours}
              onChange={(e) => updateField("business_hours", e.target.value)}
              placeholder="Saturday – Thursday, 9:00 AM – 6:00 PM"
              maxLength={200}
              className={`${textareaClass} min-h-[85px] pl-9`}
            />
          </div>
        </FormField>
      </SettingsSection>

      {/* About the business */}
      <SettingsSection
        icon={FileText}
        title="About the consultancy"
        description="Manage the introductory biography or business description shown on your public website."
      >
        <FormField
          label="Business biography"
          htmlFor="biography"
          hint="Describe your consultancy, expertise and the value you provide to clients. Maximum 4,000 characters."
        >
          <Textarea
            id="biography"
            value={form.biography}
            onChange={(e) => updateField("biography", e.target.value)}
            placeholder="Write a professional introduction to your consultancy..."
            maxLength={4000}
            className="min-h-[180px] resize-y rounded-lg border-slate-200 bg-white text-sm leading-relaxed shadow-none focus-visible:ring-[#B7792B]/30"
          />

          <div className="flex justify-end">
            <span className="text-xs text-slate-400">
              {form.biography.length.toLocaleString()} / 4,000 characters
            </span>
          </div>
        </FormField>
      </SettingsSection>

      {/* Bottom save bar */}
      <div className="sticky bottom-4 z-10 flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm">
          <UserRound size={16} className="text-slate-400" />
          {hasChanges ? (
            <span className="font-medium text-amber-700">
              You have unsaved changes.
            </span>
          ) : (
            <span className="text-slate-500">
              All changes are up to date.
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || saveMutation.isPending}
            className="border-slate-200"
          >
            Discard
          </Button>

          <Button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={!hasChanges || saveMutation.isPending}
            className="bg-[#243653] text-white hover:bg-[#1b2940]"
          >
            {saveMutation.isPending ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            Save settings
          </Button>
        </div>
      </div>
    </div>
  );
}
