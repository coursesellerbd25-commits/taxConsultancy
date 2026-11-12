
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BriefcaseBusiness,
  Check,
  Eye,
  EyeOff,
  FileText,
  ListChecks,
  LoaderCircle,
  Save,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { siteDataQuery } from "@/lib/site-data";

export const Route = createFileRoute("/admin/services")({
  component: ServicesAdmin,
});

type Row = Tables<"services">;

const lines = (items: string[]) => items.join("\n");

const toList = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);

function ServicesAdmin() {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-services-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("display_order");

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <LoaderCircle className="h-7 w-7 animate-spin text-[#243653]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700"
      >
        Services could not be loaded. Please refresh the page and try again.
      </div>
    );
  }

  const activeCount = data.filter((service) => service.enabled).length;
  const hiddenCount = data.length - activeCount;

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#a97838]">
            Website content
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Manage services
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Update the services displayed on your public website. Changes
            saved here will be reflected in the website's service content.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-600">
              {activeCount} active
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span className="text-xs text-slate-600">
              {hiddenCount} hidden
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#e5e9ef] bg-white p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef1f6] text-[#243653]">
            <BriefcaseBusiness size={19} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Service catalogue
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Expand a service to edit its information. Switch a service off
              to hide it from the public website and consultation form.
            </p>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="py-12 text-center">
            <BriefcaseBusiness className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">
              No services found
            </p>
            <p className="mt-1 text-xs text-slate-400">
              There are currently no service records to manage.
            </p>
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            className="mt-5 border-t border-slate-100"
          >
            {data.map((service) => (
              <ServiceEditor key={service.id} service={service} />
            ))}
          </Accordion>
        )}
      </div>

      <p className="text-xs leading-5 text-slate-400">
        Note: Keep service descriptions accurate and review the public website
        after making important content changes.
      </p>
    </div>
  );
}

function ServiceEditor({ service }: { service: Row }) {
  const qc = useQueryClient();

  const [v, setV] = useState({
    title: service.title,
    short: service.short_description,
    full: service.full_description,
    who: lines(service.who_needs),
    help: lines(service.help_with),
    docs: lines(service.documents),
    order: String(service.display_order),
    enabled: service.enabled,
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["admin-services-full"] });
    void qc.invalidateQueries({ queryKey: siteDataQuery.queryKey });
  };

  const update = async (patch: Partial<Row>) => {
    const { error } = await supabase
      .from("services")
      .update({
        ...patch,
        updated_at: new Date().toISOString(),
      })
      .eq("id", service.id);

    if (error) throw error;
  };

  const toggle = useMutation({
    mutationFn: (enabled: boolean) => update({ enabled }),
    onSuccess: (_data, enabled) => {
      toast.success(
        enabled
          ? "Service shown on website"
          : "Service hidden from website",
      );
      refresh();
    },
    onError: () => {
      setV((current) => ({ ...current, enabled: service.enabled }));
      toast.error("Could not update service visibility. Please try again.");
    },
  });

  const save = useMutation({
    mutationFn: () => {
      if (!v.title.trim()) {
        throw new Error("Title is required.");
      }

      return update({
        title: v.title.trim().slice(0, 120),
        short_description: v.short.trim().slice(0, 300),
        full_description: v.full.trim().slice(0, 2000),
        who_needs: toList(v.who),
        help_with: toList(v.help),
        documents: toList(v.docs),
        display_order: Number.parseInt(v.order, 10) || 0,
      });
    },
    onSuccess: () => {
      toast.success("Service information saved successfully");
      refresh();
    },
    onError: (error: Error) => {
      toast.error(
        error.message === "Title is required."
          ? error.message
          : "Could not save the service. Please try again.",
      );
    },
  });

  const updateField = <K extends keyof typeof v>(
    key: K,
    value: (typeof v)[K],
  ) => {
    setV((current) => ({ ...current, [key]: value }));
  };

  return (
    <AccordionItem value={service.id} className="border-b border-slate-100">
      <div className="flex items-center gap-3 py-2">
        <Switch
          checked={v.enabled}
          aria-label={`Show ${service.title} on website`}
          disabled={toggle.isPending}
          onCheckedChange={(checked) => {
            updateField("enabled", checked);
            toggle.mutate(checked);
          }}
        />

        <AccordionTrigger className="flex-1 py-3 text-left hover:no-underline">
          <div className="flex min-w-0 flex-1 items-center gap-3 pr-2">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                v.enabled
                  ? "bg-[#eef1f6] text-[#344c70]"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <BriefcaseBusiness size={16} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {v.title || "Untitled service"}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {v.enabled ? "Visible on website" : "Hidden from website"}
              </p>
            </div>

            <span
              className={`hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:inline-flex ${
                v.enabled
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {v.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
              {v.enabled ? "Active" : "Hidden"}
            </span>
          </div>
        </AccordionTrigger>
      </div>

      <AccordionContent>
        <form
          className="space-y-6 pb-5 pt-2"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
          }}
        >
          <div className="rounded-xl bg-[#f8f9fb] p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <FileText size={16} className="text-[#344c70]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Main information
              </h4>
            </div>

            <div className="space-y-4">
              <Field
                id={`t-${service.id}`}
                label="Service title"
                hint="Maximum 120 characters"
              >
                <Input
                  id={`t-${service.id}`}
                  maxLength={120}
                  value={v.title}
                  onChange={(event) =>
                    updateField("title", event.target.value)
                  }
                />
              </Field>

              <Field
                id={`s-${service.id}`}
                label="Short description"
                hint="Displayed on service cards · Maximum 300 characters"
              >
                <Textarea
                  id={`s-${service.id}`}
                  rows={3}
                  maxLength={300}
                  value={v.short}
                  onChange={(event) =>
                    updateField("short", event.target.value)
                  }
                />
              </Field>

              <Field
                id={`f-${service.id}`}
                label="Full description"
                hint="Detailed information about this service · Maximum 2,000 characters"
              >
                <Textarea
                  id={`f-${service.id}`}
                  rows={5}
                  maxLength={2000}
                  value={v.full}
                  onChange={(event) =>
                    updateField("full", event.target.value)
                  }
                />
              </Field>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <ListChecks size={16} className="text-[#344c70]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Service details
              </h4>
            </div>

            <div className="space-y-4">
              <Field
                id={`w-${service.id}`}
                label="Who may need this service?"
                hint="Enter one item per line. Up to 20 items."
              >
                <Textarea
                  id={`w-${service.id}`}
                  rows={4}
                  value={v.who}
                  onChange={(event) =>
                    updateField("who", event.target.value)
                  }
                />
              </Field>

              <Field
                id={`h-${service.id}`}
                label="What the consultant may help with"
                hint="Enter one item per line. Up to 20 items."
              >
                <Textarea
                  id={`h-${service.id}`}
                  rows={4}
                  value={v.help}
                  onChange={(event) =>
                    updateField("help", event.target.value)
                  }
                />
              </Field>

              <Field
                id={`d-${service.id}`}
                label="Typical documents"
                hint="Enter one document per line. Up to 20 items."
              >
                <Textarea
                  id={`d-${service.id}`}
                  rows={4}
                  value={v.docs}
                  onChange={(event) =>
                    updateField("docs", event.target.value)
                  }
                />
              </Field>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-end sm:justify-between">
            <Field
              id={`o-${service.id}`}
              label="Display order"
              hint="Lower numbers appear first"
            >
              <Input
                id={`o-${service.id}`}
                type="number"
                className="w-full sm:w-36"
                value={v.order}
                onChange={(event) =>
                  updateField("order", event.target.value)
                }
              />
            </Field>

            <Button
              type="submit"
              disabled={save.isPending || toggle.isPending}
              className="bg-[#243653] text-white hover:bg-[#30486b]"
            >
              {save.isPending ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save service
            </Button>
          </div>
        </form>
      </AccordionContent>
    </AccordionItem>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-semibold text-slate-700">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] leading-5 text-slate-400">{hint}</p>}
    </div>
  );
}
