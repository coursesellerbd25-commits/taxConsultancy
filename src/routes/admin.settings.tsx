
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Building2,
  Clock3,
  Contact,
  FileText,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Save,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { supabase } from "@/integrations/supabase/client";
import { siteDataQuery } from "@/lib/site-data";

export const Route = createFileRoute("/admin/settings")({
  component: Settings,
});

const FIELDS = [
  { key: "business_name", label: "Business name", max: 120 },
  { key: "tagline", label: "Tagline", max: 120 },
  { key: "consultant_name", label: "Consultant name", max: 120 },
  { key: "contact_email", label: "Contact email", max: 255, type: "email" },
  { key: "contact_phone", label: "Contact phone", max: 30, type: "tel" },
  {
    key: "whatsapp_number",
    label: "WhatsApp number",
    max: 15,
    placeholder: "8801XXXXXXXXX",
  },
  {
    key: "whatsapp_message",
    label: "WhatsApp greeting message",
    max: 300,
  },
  { key: "office_address", label: "Office address", max: 300 },
  { key: "business_hours", label: "Business hours", max: 200 },
  {
    key: "biography",
    label: "Professional biography",
    max: 4000,
    multiline: true,
  },
] as const;

type Key = (typeof FIELDS)[number]["key"];
type Values = Record<Key, string>;

const sections = [
  {
    title: "Business identity",
    description: "Your consultancy's name and public-facing tagline.",
    icon: Building2,
    fields: ["business_name", "tagline"],
  },
  {
    title: "Consultant profile",
    description: "The name and professional information shown to visitors.",
    icon: FileText,
    fields: ["consultant_name", "biography"],
  },
  {
    title: "Contact information",
    description: "How prospective clients can contact your business.",
    icon: Contact,
    fields: ["contact_email", "contact_phone"],
  },
  {
    title: "WhatsApp contact",
    description: "Configure the WhatsApp contact button and greeting.",
    icon: MessageCircle,
    fields: ["whatsapp_number", "whatsapp_message"],
  },
  {
    title: "Office information",
    description: "Your office location and business availability.",
    icon: MapPin,
    fields: ["office_address", "business_hours"],
  },
] as const;

function Settings() {
  const qc = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
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

  const [values, setValues] = useState<Values | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data !== undefined && values === null) {
      setValues(
        Object.fromEntries(
          FIELDS.map((field) => [
            field.key,
            (data?.[field.key] as string | null) ?? "",
          ]),
        ) as Values,
      );
    }
  }, [data, values]);

  const save = useMutation({
    mutationFn: async (v: Values) => {
      const row = Object.fromEntries(
        Object.entries(v).map(([key, value]) => [
          key,
          value.trim() || null,
        ]),
      ) as Record<Key, string | null>;

      if (row.whatsapp_number) {
        row.whatsapp_number = row.whatsapp_number.replace(/\D/g, "");
      }

      if (
        row.whatsapp_number &&
        !/^[0-9]{8,15}$/.test(row.whatsapp_number)
      ) {
        throw new Error(
          "WhatsApp number must be 8–15 digits including the country code.",
        );
      }

      if (
        row.contact_email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.contact_email)
      ) {
        throw new Error("Enter a valid contact email.");
      }

      const { error } = await supabase
        .from("site_settings")
        .upsert({
          id: 1,
          ...row,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw new Error("Settings could not be saved. Please try again.");
      }
    },

    onSuccess: () => {
      setError(null);
      toast.success("Website settings saved successfully");

      void qc.invalidateQueries({ queryKey: siteDataQuery.queryKey });
      void qc.invalidateQueries({ queryKey: ["admin-settings"] });
    },

    onError: (e: Error) => {
      setError(e.message);
    },
  });

  const updateField = (key: Key, value: string) => {
    setValues((current) =>
      current ? { ...current, [key]: value } : current,
    );
    setError(null);
  };

  if (isLoading || (!values && !isError)) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <LoaderCircle className="h-7 w-7 animate-spin text-[#243653]" />
      </div>
    );
  }

  if (isError || !values) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700"
      >
        Website settings could not be loaded. Please refresh the page and try
        again.
        {queryError instanceof Error && (
          <p className="mt-1 text-xs">{queryError.message}</p>
        )}
      </div>
    );
  }

  const renderField = (key: Key) => {
    const field = FIELDS.find((item) => item.key === key);
    if (!field) return null;

    const value = values[key];

    return (
      <div key={field.key} className="space-y-2">
        <Label
          htmlFor={field.key}
          className="text-xs font-semibold text-slate-700"
        >
          {field.label}
        </Label>

        {"multiline" in field ? (
          <Textarea
            id={field.key}
            rows={6}
            maxLength={field.max}
            value={value}
            onChange={(event) => updateField(field.key, event.target.value)}
            placeholder="Write a concise professional biography..."
            className="resize-y"
          />
        ) : (
          <Input
            id={field.key}
            type={"type" in field ? field.type : "text"}
            maxLength={field.max}
            value={value}
            placeholder={"placeholder" in field ? field.placeholder : undefined}
            onChange={(event) => updateField(field.key, event.target.value)}
          />
        )}

        <div className="flex justify-end">
          <span className="text-[10px] text-slate-400">
            {value.length}/{field.max}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-7">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#a97838]">
          Website configuration
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Website settings
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage the business information displayed across your public
          website. Keep these details accurate and up to date.
        </p>
      </div>

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate(values);
        }}
      >
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <section
              key={section.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.03)] sm:p-6"
            >
              <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef1f6] text-[#344c70]">
                  <Icon size={18} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {section.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                {section.fields.map((key) => (
                  <div
                    key={key}
                    className={
                      key === "biography" || key === "whatsapp_message"
                        ? "md:col-span-2"
                        : ""
                    }
                  >
                    {renderField(key)}
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <div className="sticky bottom-3 z-20 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:flex sm:items-center sm:justify-between sm:px-5">
          <div className="mb-2 flex items-center gap-2 sm:mb-0">
            <Clock3 size={15} className="text-slate-400" />
            <p className="text-[11px] text-slate-500">
              Changes are saved to your website settings.
            </p>
          </div>

          <Button
            type="submit"
            disabled={save.isPending}
            className="w-full bg-[#243653] text-white hover:bg-[#30486b] sm:w-auto"
          >
            {save.isPending ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save settings
          </Button>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
