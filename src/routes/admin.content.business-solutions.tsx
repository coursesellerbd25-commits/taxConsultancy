import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Plus, Pencil, Trash2, X, Save, Search, BriefcaseBusiness, Eye,
  EyeOff, GripVertical, ListChecks, Loader2, CheckCircle2,
  AlertCircle, ArrowUpDown, ExternalLink, LayoutTemplate,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/content/business-solutions")({
  component: BusinessSolutionsPage,
});

type Solution = {
  id: string;
  title: string;
  slug: string;
  category: string;
  items: string[];
  display_order: number;
  enabled: boolean;
  updated_at: string;
};

type SolutionForm = {
  title: string;
  slug: string;
  category: string;
  items: string;
  display_order: number;
  enabled: boolean;
};

type PageSettings = {
  id: number;
  eyebrow: string;
  page_title: string;
  page_description: string;
  cta_title: string;
  cta_text: string;
};

type SettingsForm = Omit<PageSettings, "id">;

const EMPTY_SOLUTION: SolutionForm = {
  title: "", slug: "", category: "business-registration", items: "",
  display_order: 0, enabled: true,
};
const EMPTY_SETTINGS: SettingsForm = {
  eyebrow: "Business Solutions",
  page_title: "Support for every stage of your business",
  page_description: "Whether you are starting out, growing, or entering Bangladesh as a foreign investor.",
  cta_title: "Need clarity on your tax or compliance requirements?",
  cta_text: "Tell us what you need help with and request a consultation.",
};
const CATEGORY_OPTIONS = [
  { value: "business-registration", label: "Business Startup & Registration" },
  { value: "accounting", label: "Accounting & Auditing" },
  { value: "regulatory-licenses", label: "Regulatory Licenses & Corporate Affairs" },
  { value: "foreign-investment", label: "Foreign Investment & Business Setup" },
  { value: "taxation", label: "Taxation Services" },
  { value: "vat", label: "VAT Services" },
];
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10";
const textareaClass = `${inputClass} min-h-28 resize-y`;
const TABLE = "business_solutions";
const SETTINGS_TABLE = "business_solutions_page_settings";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function lines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}
function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <div className="space-y-2"><label className="block text-sm font-semibold text-[#243653]">{label}</label>{children}{hint && <p className="text-xs leading-5 text-slate-500">{hint}</p>}</div>;
}
function SummaryCard({ label, value, icon, tone = "navy" }: { label: string; value: number; icon: ReactNode; tone?: "navy" | "green" | "amber" }) {
  const styles = { navy: "bg-[#243653]/10 text-[#243653]", green: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600" };
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">{label}</p><div className={`rounded-xl p-2.5 ${styles[tone]}`}>{icon}</div></div><p className="mt-4 text-3xl font-bold tracking-tight text-[#243653]">{value}</p></div>;
}

function BusinessSolutionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<Solution | null>(null);
  const [form, setForm] = useState<SolutionForm>(EMPTY_SOLUTION);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [settingsForm, setSettingsForm] = useState<SettingsForm>(EMPTY_SETTINGS);
  const [settingsNotice, setSettingsNotice] = useState("");
  const [settingsError, setSettingsError] = useState("");

  const solutionsQuery = useQuery({
    queryKey: ["admin-business-solutions"],
    queryFn: async () => {
      const { data, error } = await supabase.from(TABLE)
        .select("id,title,slug,category,items,display_order,enabled,updated_at")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Solution[];
    },
  });
  const settingsQuery = useQuery({
    queryKey: ["admin-business-solutions-page-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from(SETTINGS_TABLE).select("id,eyebrow,page_title,page_description,cta_title,cta_text").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data as PageSettings | null;
    },
  });
  const solutions = solutionsQuery.data ?? [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return solutions;
    return solutions.filter((s) => `${s.title} ${s.slug} ${s.category} ${(s.items ?? []).join(" ")}`.toLowerCase().includes(q));
  }, [solutions, search]);

  // Populate the page settings form after the database record has loaded.
  useEffect(() => {
    const loadedSettings = settingsQuery.data;
    if (!loadedSettings) return;
    setSettingsForm({
      eyebrow: loadedSettings.eyebrow ?? "",
      page_title: loadedSettings.page_title ?? "",
      page_description: loadedSettings.page_description ?? "",
      cta_title: loadedSettings.cta_title ?? "",
      cta_text: loadedSettings.cta_text ?? "",
    });
  }, [settingsQuery.data]);

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-business-solutions"] }),
      queryClient.invalidateQueries({ queryKey: ["business-solutions"] }),
      queryClient.invalidateQueries({ queryKey: ["business-solutions-page-settings"] }),
    ]);
  };
  const saveMutation = useMutation({
    mutationFn: async (values: SolutionForm) => {
      const payload = { title: values.title.trim(), slug: values.slug.trim() || slugify(values.title), category: values.category, items: lines(values.items), display_order: Number(values.display_order), enabled: values.enabled, updated_at: new Date().toISOString() };
      const result = editing
        ? await supabase.from(TABLE).update(payload).eq("id", editing.id)
        : await supabase.from(TABLE).insert(payload);
      if (result.error) throw result.error;
    },
    onSuccess: async () => { await invalidate(); setShowEditor(false); setEditing(null); setForm(EMPTY_SOLUTION); setNotice(editing ? "Business solution updated." : "Business solution created."); },
    onError: (error: Error) => setFormError(error.message || "Unable to save this solution."),
  });
  const settingsMutation = useMutation({
    mutationFn: async (values: SettingsForm) => {
      const { error } = await supabase.from(SETTINGS_TABLE).upsert({ id: 1, ...values, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: async () => { await invalidate(); setSettingsNotice("Page content saved."); setSettingsError(""); },
    onError: (error: Error) => setSettingsError(error.message || "Unable to save page content."),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from(TABLE).delete().eq("id", id); if (error) throw error; },
    onSuccess: async () => { await invalidate(); setNotice("Business solution deleted."); },
  });
  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => { const { error } = await supabase.from(TABLE).update({ enabled, updated_at: new Date().toISOString() }).eq("id", id); if (error) throw error; },
    onSuccess: invalidate,
  });

  function openCreate() { setEditing(null); setForm({ ...EMPTY_SOLUTION, display_order: solutions.length + 1 }); setFormError(""); setShowEditor(true); }
  function openEdit(solution: Solution) { setEditing(solution); setForm({ title: solution.title ?? "", slug: solution.slug ?? "", category: solution.category ?? "business-registration", items: (solution.items ?? []).join("\n"), display_order: solution.display_order ?? 0, enabled: solution.enabled ?? true }); setFormError(""); setShowEditor(true); }
  function submitSolution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setFormError("");
    if (!form.title.trim()) return setFormError("Enter a solution title.");
    if (!lines(form.items).length) return setFormError("Add at least one checklist item.");
    if (form.slug.trim() && !/^[a-z0-9-]+$/.test(form.slug.trim())) return setFormError("Slug can contain lowercase letters, numbers, and hyphens only.");
    if (!Number.isFinite(Number(form.display_order))) return setFormError("Enter a valid display order.");
    saveMutation.mutate(form);
  }
  function removeSolution(solution: Solution) {
    if (window.confirm(`Delete “${solution.title}”? This cannot be undone.`)) deleteMutation.mutate(solution.id);
  }
  function submitSettings(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSettingsError(""); settingsMutation.mutate(settingsForm); }

  if (solutionsQuery.isLoading || settingsQuery.isLoading) return <div className="flex min-h-[55vh] items-center justify-center gap-3 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Loading Business Solutions CMS...</div>;
  if (solutionsQuery.isError || settingsQuery.isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"><div className="flex items-center gap-2 font-semibold"><AlertCircle className="h-5 w-5" />Unable to load Business Solutions CMS</div><p className="mt-2">{solutionsQuery.error?.message || settingsQuery.error?.message}</p><button onClick={() => { solutionsQuery.refetch(); settingsQuery.refetch(); }} className="mt-4 rounded-lg bg-[#243653] px-4 py-2 font-semibold text-white">Try again</button></div>;

  const published = solutions.filter((s) => s.enabled).length;
  return <div className="mx-auto w-full max-w-7xl space-y-7 pb-12">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#B7792B]"><BriefcaseBusiness className="h-4 w-4" />Website Content Management</div><h1 className="text-2xl font-bold tracking-tight text-[#243653] sm:text-3xl">Business Solutions</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Manage the page introduction, four audience-focused solution cards, checklist items, related service links, and publication order.</p></div>
      <a href="https://corporate-tax-bangladesh.vercel.app/business-solutions" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#243653] hover:bg-slate-50">Preview public page <ExternalLink className="h-4 w-4" /></a>
    </header>
    {notice && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />{notice}<button onClick={() => setNotice("")} className="ml-auto"><X className="h-4 w-4" /></button></div>}
    {(deleteMutation.isError || toggleMutation.isError) && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{deleteMutation.error?.message || toggleMutation.error?.message}</div>}

    <div className="grid gap-4 sm:grid-cols-3"><SummaryCard label="Total Solution Cards" value={solutions.length} icon={<BriefcaseBusiness className="h-5 w-5" />} /><SummaryCard label="Published on Website" value={published} icon={<Eye className="h-5 w-5" />} tone="green" /><SummaryCard label="Hidden Cards" value={solutions.length - published} icon={<EyeOff className="h-5 w-5" />} tone="amber" /></div>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6"><div className="rounded-xl bg-[#243653]/10 p-2.5 text-[#243653]"><LayoutTemplate className="h-5 w-5" /></div><div><h2 className="font-bold text-[#243653]">Page Header & Consultation CTA</h2><p className="mt-1 text-xs text-slate-500">Edit the heading and call-to-action text shown on this landing page.</p></div></div>
      <form onSubmit={submitSettings} className="space-y-5 p-5 sm:p-6">
        <div className="grid gap-5 md:grid-cols-2"><Field label="Eyebrow"><input className={inputClass} value={settingsForm.eyebrow} onChange={(e) => setSettingsForm({ ...settingsForm, eyebrow: e.target.value })} /></Field><Field label="Page Title"><input className={inputClass} required value={settingsForm.page_title} onChange={(e) => setSettingsForm({ ...settingsForm, page_title: e.target.value })} /></Field></div>
        <Field label="Page Description"><textarea className={textareaClass} rows={2} value={settingsForm.page_description} onChange={(e) => setSettingsForm({ ...settingsForm, page_description: e.target.value })} /></Field>
        <div className="grid gap-5 border-t border-slate-100 pt-5 md:grid-cols-2"><Field label="CTA Heading"><input className={inputClass} value={settingsForm.cta_title} onChange={(e) => setSettingsForm({ ...settingsForm, cta_title: e.target.value })} /></Field><Field label="CTA Description"><textarea className={textareaClass} rows={2} value={settingsForm.cta_text} onChange={(e) => setSettingsForm({ ...settingsForm, cta_text: e.target.value })} /></Field></div>
        {settingsError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{settingsError}</p>}{settingsNotice && <p className="text-sm text-emerald-700">{settingsNotice}</p>}
        <div className="flex justify-end"><button type="submit" disabled={settingsMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-[#243653] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1b2a42] disabled:opacity-60">{settingsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save Page Content</button></div>
      </form>
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="font-bold text-[#243653]">Solution Cards</h2><p className="mt-1 text-xs text-slate-500">Each card contains a title, a related service destination, and a checklist.</p></div><button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#243653] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1b2a42]"><Plus className="h-4 w-4" />Add Solution Card</button></div>
      {showEditor && <div className="border-b border-slate-200 bg-slate-50/70 p-5 sm:p-7"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#B7792B]">Solution Card Editor</p><h3 className="mt-1 text-lg font-bold text-[#243653]">{editing ? "Edit Solution Card" : "Create Solution Card"}</h3></div><button onClick={() => setShowEditor(false)} aria-label="Close editor" className="rounded-lg p-2 text-slate-500 hover:bg-white"><X className="h-5 w-5" /></button></div>
        <form onSubmit={submitSolution} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2"><Field label="Card Title *"><input className={inputClass} required value={form.title} onChange={(e) => { const title = e.target.value; setForm((p) => ({ ...p, title, slug: !editing || p.slug === slugify(p.title) ? slugify(title) : p.slug })); }} placeholder="e.g. Startup Business Solutions" /></Field><Field label="URL Slug *" hint="Used as the card anchor ID. Use lowercase letters, numbers, and hyphens."><input className={inputClass} required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })} placeholder="startup-business-solutions" /></Field></div>
          <Field label="Related Service Category *" hint="Controls the Related services button destination on the public page."><select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
          <Field label="Checklist Items *" hint="Enter one item per line. These appear with check icons inside the public solution card."><textarea className={textareaClass} rows={8} required value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} placeholder={'Business structure guidance\nCompany registration assistance\nTIN and BIN registration'} /></Field>
          <div className="grid gap-5 sm:grid-cols-2"><Field label="Display Order" hint="Smaller numbers appear first."><input type="number" min={0} className={inputClass} value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></Field><div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"><div><p className="text-sm font-semibold text-[#243653]">Publish this card</p><p className="mt-1 text-xs text-slate-500">Show it on the public page.</p></div><button type="button" role="switch" aria-checked={form.enabled} onClick={() => setForm({ ...form, enabled: !form.enabled })} className={`relative h-6 w-11 rounded-full transition ${form.enabled ? "bg-emerald-500" : "bg-slate-300"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${form.enabled ? "left-6" : "left-1"}`} /></button></div></div>
          {formError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={() => setShowEditor(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600">Cancel</button><button type="submit" disabled={saveMutation.isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#243653] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">{saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saveMutation.isPending ? "Saving..." : editing ? "Save Changes" : "Create Solution"}</button></div>
        </form>
      </div>}
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><p className="text-sm font-semibold text-[#243653]">All Business Solutions</p><p className="mt-1 text-xs text-slate-500">Drag handle is visual only; change order using the Display Order field.</p></div><div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search solution cards..." className={`${inputClass} pl-9`} /></div></div>
      {filtered.length === 0 ? <div className="px-6 py-14 text-center"><BriefcaseBusiness className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-3 font-semibold text-[#243653]">{search ? "No matching cards" : "No solution cards yet"}</h3><p className="mt-1 text-sm text-slate-500">{search ? "Try a different search." : "Add the first solution card to get started."}</p></div> : <div className="divide-y divide-slate-100">{filtered.map((solution) => <article key={solution.id} className="p-5 transition hover:bg-slate-50/60 sm:px-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="flex min-w-0 gap-3"><div className="mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 sm:flex"><GripVertical className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-[#243653]">{solution.title}</h3><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${solution.enabled ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{solution.enabled ? "Published" : "Hidden"}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-500">Order: {solution.display_order}</span></div><p className="mt-1 text-xs text-slate-400">#{solution.slug}</p><p className="mt-2 text-xs font-medium text-[#B7792B]">{CATEGORY_OPTIONS.find((c) => c.value === solution.category)?.label ?? solution.category}</p><div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><ListChecks className="h-3.5 w-3.5" />{solution.items?.length ?? 0} checklist items</span><span className="inline-flex items-center gap-1.5"><ArrowUpDown className="h-3.5 w-3.5" />Display order {solution.display_order}</span></div></div></div><div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-100 pt-3 lg:border-0 lg:pt-0"><button onClick={() => toggleMutation.mutate({ id: solution.id, enabled: !solution.enabled })} disabled={toggleMutation.isPending} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">{solution.enabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{solution.enabled ? "Hide" : "Publish"}</button><button onClick={() => openEdit(solution)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#243653] hover:bg-slate-100"><Pencil className="h-4 w-4" />Edit</button><button onClick={() => removeSolution(solution)} disabled={deleteMutation.isPending} className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 className="h-4 w-4" />Delete</button></div></div><ul className="mt-4 grid gap-2 pl-0 sm:grid-cols-2 lg:grid-cols-3">{(solution.items ?? []).slice(0, 6).map((item, index) => <li key={`${solution.id}-${index}`} className="flex gap-2 text-xs text-slate-600"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#B7792B]" />{item}</li>)}</ul>{(solution.items?.length ?? 0) > 6 && <p className="mt-2 text-xs text-slate-400">+{solution.items.length - 6} more checklist items</p>}</article>)}</div>}
      <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6"><span>Showing {filtered.length} of {solutions.length} solution cards</span><span className="inline-flex items-center gap-1.5"><ArrowUpDown className="h-3.5 w-3.5" />Sorted by display order</span></div>
    </section>
  </div>;
}
