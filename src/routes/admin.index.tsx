import { COURSE_PREFIX, findCourse, findService } from "@/content/catalog";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Inbox, LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/")({ component: Inquiries });

type Inquiry = Tables<"inquiries">;
const STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
] as const;
const statusLabel = (s: string) => STATUSES.find((x) => x.value === s)?.label ?? s;
const fmt = (d: string) => new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

function Inquiries() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data;
    },
  });
  const { data: services } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => (await supabase.from("services").select("slug,title")).data ?? [],
  });
  const serviceTitle = (slug: string) => services?.find((s) => s.slug === slug)?.title ?? findService(slug)?.title ?? findCourse(slug.replace(COURSE_PREFIX, ""))?.title ?? slug;

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((r) => (filter === "all" || r.status === filter) &&
      (!q || r.full_name.toLowerCase().includes(q) || r.email.includes(q) || r.phone.includes(q)));
  }, [data, filter, search]);
  const open = data?.find((r) => r.id === openId) ?? null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Inquiries</h1>
          <p className="text-sm text-muted-foreground">{data ? `${data.filter((r) => r.status === "new").length} new · ${data.length} total` : " "}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Input placeholder="Search name, email or phone" aria-label="Search inquiries" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:w-64" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="sm:w-40" aria-label="Filter by status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 rounded-md border bg-card">
        {isLoading ? (
          <div className="flex justify-center p-10"><LoaderCircle className="animate-spin text-primary" aria-label="Loading" /></div>
        ) : error ? (
          <p role="alert" className="p-6 text-sm text-destructive">Inquiries could not be loaded. Please refresh the page.</p>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
            <Inbox className="h-8 w-8" aria-hidden />
            <p>{data?.length ? "No inquiries match your filters." : "No inquiries yet. New consultation requests will appear here."}</p>
          </div>
        ) : (
          <ul className="divide-y">
            {rows.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => setOpenId(r.id)} className="flex w-full flex-col gap-1 p-4 text-left hover:bg-surface sm:flex-row sm:items-center sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-primary">{r.full_name}</p>
                    <p className="truncate text-sm text-muted-foreground">{serviceTitle(r.service_slug)} · {r.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{fmt(r.created_at)}</span>
                  <Badge variant={r.status === "new" ? "default" : "secondary"} className="w-fit">{statusLabel(r.status)}</Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {open && <InquiryDetail key={open.id} inquiry={open} serviceTitle={serviceTitle(open.service_slug)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function InquiryDetail({ inquiry, serviceTitle }: { inquiry: Inquiry; serviceTitle: string }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState(inquiry.status);
  const [notes, setNotes] = useState(inquiry.internal_notes);
  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("inquiries")
        .update({ status, internal_notes: notes.slice(0, 5000), updated_at: new Date().toISOString() }).eq("id", inquiry.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Inquiry updated"); qc.invalidateQueries({ queryKey: ["admin-inquiries"] }); },
    onError: () => toast.error("Could not save changes. Please try again."),
  });

  const fields: [string, string][] = [
    ["Email", inquiry.email], ["Phone", inquiry.phone], ["Preferred contact", inquiry.preferred_contact_method],
    ["Client category", inquiry.client_category], ["Service", serviceTitle],
    ["Country", inquiry.country], ["Preferred date", inquiry.preferred_date ?? "—"],
    ["Preferred time", inquiry.preferred_time || "—"], ["Received", fmt(inquiry.created_at)], ["Consent given", fmt(inquiry.consent_at)],
  ];

  return (
    <div className="space-y-6">
      <SheetHeader>
        <SheetTitle>{inquiry.full_name}</SheetTitle>
        <SheetDescription>Consultation inquiry</SheetDescription>
      </SheetHeader>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        {fields.map(([k, v]) => (<div key={k} className="contents"><dt className="text-muted-foreground">{k}</dt><dd className="break-words">{v}</dd></div>))}
      </dl>
      <div>
        <p className="text-sm font-medium">Message</p>
        <p className="mt-1 whitespace-pre-wrap rounded-md border bg-surface p-3 text-sm">{inquiry.message}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline"><a href={`mailto:${inquiry.email}`}>Email</a></Button>
        <Button asChild size="sm" variant="outline"><a href={`tel:${inquiry.phone}`}>Call</a></Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="status"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Internal notes (never shown to the visitor)</Label>
        <Textarea id="notes" rows={5} maxLength={5000} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <Button onClick={() => save.mutate()} disabled={save.isPending}>
        {save.isPending && <LoaderCircle className="animate-spin" />} Save changes
      </Button>
    </div>
  );
}
