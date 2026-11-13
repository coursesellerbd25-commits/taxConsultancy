import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { siteDataQuery } from "@/lib/site-data";

export const Route = createFileRoute("/admin/services")({ component: ServicesAdmin });

type Row = Tables<"services">;

function ServicesAdmin() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-services-full"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });
  if (isLoading) return <div className="flex justify-center p-10"><LoaderCircle className="animate-spin text-primary" aria-label="Loading" /></div>;
  if (error || !data) return <p role="alert" className="text-sm text-destructive">Services could not be loaded. Please refresh.</p>;
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Services</h1>
      <p className="mt-1 text-sm text-muted-foreground">Turn off any service you do not offer. Disabled services are hidden from the website and the consultation form.</p>
      <Accordion type="single" collapsible className="mt-6 rounded-md border bg-card px-4">
        {data.map((s) => <ServiceEditor key={s.id} service={s} />)}
      </Accordion>
    </div>
  );
}

const lines = (a: string[]) => a.join("\n");
const toList = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 20);

function ServiceEditor({ service }: { service: Row }) {
  const qc = useQueryClient();
  const [v, setV] = useState({
    title: service.title, short: service.short_description, full: service.full_description,
    who: lines(service.who_needs), help: lines(service.help_with), docs: lines(service.documents),
    order: String(service.display_order), enabled: service.enabled,
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-services-full"] }); qc.invalidateQueries({ queryKey: siteDataQuery.queryKey }); };
  const update = async (patch: Partial<Row>) => {
    const { error } = await supabase.from("services").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", service.id);
    if (error) throw error;
  };
  const toggle = useMutation({
    mutationFn: (enabled: boolean) => update({ enabled }),
    onSuccess: (_d, enabled) => { toast.success(enabled ? "Service shown on website" : "Service hidden from website"); refresh(); },
    onError: () => { setV((x) => ({ ...x, enabled: service.enabled })); toast.error("Could not update. Please try again."); },
  });
  const save = useMutation({
    mutationFn: () => {
      if (!v.title.trim()) throw new Error("Title is required.");
      return update({
        title: v.title.trim().slice(0, 120), short_description: v.short.trim().slice(0, 300), full_description: v.full.trim().slice(0, 2000),
        who_needs: toList(v.who), help_with: toList(v.help), documents: toList(v.docs), display_order: Number.parseInt(v.order) || 0,
      });
    },
    onSuccess: () => { toast.success("Service saved"); refresh(); },
    onError: (e: Error) => toast.error(e.message === "Title is required." ? e.message : "Could not save. Please try again."),
  });

  return (
    <AccordionItem value={service.id}>
      <div className="flex items-center gap-3">
        <Switch checked={v.enabled} aria-label={`Show ${service.title} on website`} disabled={toggle.isPending}
          onCheckedChange={(c) => { setV({ ...v, enabled: c }); toggle.mutate(c); }} />
        <AccordionTrigger className="flex-1 text-left">
          <span>{service.title}{!v.enabled && <span className="ml-2 text-xs font-normal text-muted-foreground">(hidden)</span>}</span>
        </AccordionTrigger>
      </div>
      <AccordionContent>
        <form className="space-y-4 pb-2" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <Field id={`t-${service.id}`} label="Title"><Input id={`t-${service.id}`} maxLength={120} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} /></Field>
          <Field id={`s-${service.id}`} label="Short description (cards)"><Textarea id={`s-${service.id}`} rows={2} maxLength={300} value={v.short} onChange={(e) => setV({ ...v, short: e.target.value })} /></Field>
          <Field id={`f-${service.id}`} label="Full description"><Textarea id={`f-${service.id}`} rows={3} maxLength={2000} value={v.full} onChange={(e) => setV({ ...v, full: e.target.value })} /></Field>
          <Field id={`w-${service.id}`} label="Who may need this (one per line)"><Textarea id={`w-${service.id}`} rows={3} value={v.who} onChange={(e) => setV({ ...v, who: e.target.value })} /></Field>
          <Field id={`h-${service.id}`} label="What the consultant may help with (one per line)"><Textarea id={`h-${service.id}`} rows={3} value={v.help} onChange={(e) => setV({ ...v, help: e.target.value })} /></Field>
          <Field id={`d-${service.id}`} label="Typical documents (one per line)"><Textarea id={`d-${service.id}`} rows={3} value={v.docs} onChange={(e) => setV({ ...v, docs: e.target.value })} /></Field>
          <Field id={`o-${service.id}`} label="Display order"><Input id={`o-${service.id}`} type="number" className="w-28" value={v.order} onChange={(e) => setV({ ...v, order: e.target.value })} /></Field>
          <Button type="submit" disabled={save.isPending}>{save.isPending && <LoaderCircle className="animate-spin" />} Save service</Button>
        </form>
      </AccordionContent>
    </AccordionItem>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}</div>;
}
