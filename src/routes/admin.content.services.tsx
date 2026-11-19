import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Plus, Search, Pencil, Trash2, Eye, EyeOff, X, BriefcaseBusiness,
  Loader2, AlertCircle, CheckCircle2, ArrowUpDown, FolderOpen,
  Layers3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/content/services")({ component: ServicesPage });

type Category = {
  id: string; title: string; slug: string; letter: string; icon: string;
  summary: string; note: string; authority: string[]; who_needs: string[];
  documents: string[]; why: string; benefits: string[]; process: string[];
  display_order: number; enabled: boolean; updated_at: string;
};
type Service = {
  id: string; category_slug: string; title: string; slug: string;
  short_description: string; full_description: string; who_needs: string[];
  help_with: string[]; documents: string[]; availability: string;
  display_order: number; enabled: boolean; updated_at: string;
};
type CategoryForm = {
  title: string; slug: string; letter: string; icon: string; summary: string;
  note: string; authority: string; who_needs: string; documents: string;
  why: string; benefits: string; process: string; display_order: string; enabled: boolean;
};
type ServiceForm = {
  category_slug: string; title: string; slug: string; short_description: string;
  full_description: string; who_needs: string; help_with: string; documents: string;
  availability: string; display_order: string; enabled: boolean;
};

const categorySeed: CategoryForm = {
  title: "", slug: "", letter: "A", icon: "BriefcaseBusiness", summary: "", note: "",
  authority: "", who_needs: "", documents: "", why: "", benefits: "", process: "",
  display_order: "0", enabled: true,
};
const serviceSeed: ServiceForm = {
  category_slug: "", title: "", slug: "", short_description: "", full_description: "",
  who_needs: "", help_with: "", documents: "", availability: "Contact for availability",
  display_order: "0", enabled: true,
};
const toArray = (v: string) => v.split("\n").map((x) => x.trim()).filter(Boolean);
const toLines = (v?: string[] | null) => Array.isArray(v) ? v.join("\n") : "";
const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const field = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#B7792B] focus:ring-2 focus:ring-[#B7792B]/10";
const label = "mb-1.5 block text-sm font-medium text-slate-700";

function ServicesPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"categories" | "services">("services");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryEditor, setCategoryEditor] = useState(false);
  const [serviceEditor, setServiceEditor] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: "category" | "service"; row: Category | Service } | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(categorySeed);
  const [serviceForm, setServiceForm] = useState<ServiceForm>(serviceSeed);
  const [errorText, setErrorText] = useState("");
  const [notice, setNotice] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["admin-service-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_categories").select("*").order("display_order").order("title");
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });
  const servicesQuery = useQuery({
    queryKey: ["admin-business-solutions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("display_order").order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Service[];
    },
  });
  const categories = categoriesQuery.data ?? [];
  const services = servicesQuery.data ?? [];
  const filteredCategories = useMemo(() => categories.filter((c) => {
    const q = search.toLowerCase();
    return (!q || `${c.title} ${c.slug} ${c.summary}`.toLowerCase().includes(q)) &&
      (statusFilter === "all" || (statusFilter === "published" ? c.enabled : !c.enabled));
  }), [categories, search, statusFilter]);
  const filteredServices = useMemo(() => services.filter((s) => {
    const q = search.toLowerCase();
    return (!q || `${s.title} ${s.slug} ${s.short_description}`.toLowerCase().includes(q)) &&
      (categoryFilter === "all" || s.category_slug === categoryFilter) &&
      (statusFilter === "all" || (statusFilter === "published" ? s.enabled : !s.enabled));
  }), [services, search, categoryFilter, statusFilter]);
  const publishedServices = services.filter((s) => s.enabled).length;
  const hiddenServices = services.length - publishedServices;

  const invalidate = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["admin-service-categories"] }),
      qc.invalidateQueries({ queryKey: ["admin-business-solutions"] }),
      qc.invalidateQueries({ queryKey: ["services"] }),
      qc.invalidateQueries({ queryKey: ["service-categories"] }),
    ]);
  };
  const closeEditors = () => {
    setCategoryEditor(false); setServiceEditor(false); setEditingCategory(null); setEditingService(null);
    setCategoryForm(categorySeed); setServiceForm(serviceSeed); setErrorText("");
  };
  const openNewCategory = () => { setEditingCategory(null); setCategoryForm({ ...categorySeed, letter: String.fromCharCode(65 + categories.length), display_order: String(categories.length) }); setErrorText(""); setCategoryEditor(true); };
  const openEditCategory = (c: Category) => {
    setEditingCategory(c); setCategoryForm({ title: c.title, slug: c.slug, letter: c.letter, icon: c.icon ?? "BriefcaseBusiness", summary: c.summary ?? "", note: c.note ?? "", authority: toLines(c.authority), who_needs: toLines(c.who_needs), documents: toLines(c.documents), why: c.why ?? "", benefits: toLines(c.benefits), process: toLines(c.process), display_order: String(c.display_order ?? 0), enabled: c.enabled }); setErrorText(""); setCategoryEditor(true);
  };
  const openNewService = () => { setEditingService(null); setServiceForm({ ...serviceSeed, category_slug: categoryFilter !== "all" ? categoryFilter : categories[0]?.slug ?? "", display_order: String(services.length) }); setErrorText(""); setServiceEditor(true); };
  const openEditService = (s: Service) => {
    setEditingService(s); setServiceForm({ category_slug: s.category_slug ?? "", title: s.title, slug: s.slug, short_description: s.short_description ?? "", full_description: s.full_description ?? "", who_needs: toLines(s.who_needs), help_with: toLines(s.help_with), documents: toLines(s.documents), availability: s.availability ?? "Contact for availability", display_order: String(s.display_order ?? 0), enabled: s.enabled }); setErrorText(""); setServiceEditor(true);
  };

  const saveCategory = useMutation({
    mutationFn: async () => {
      const title = categoryForm.title.trim(); const slug = slugify(categoryForm.slug || title);
      if (!title || !slug) throw new Error("Enter a category title and valid slug.");
      const payload = { title, slug, letter: categoryForm.letter.trim().toUpperCase().slice(0, 1) || "A", icon: categoryForm.icon.trim() || "BriefcaseBusiness", summary: categoryForm.summary.trim(), note: categoryForm.note.trim(), authority: toArray(categoryForm.authority), who_needs: toArray(categoryForm.who_needs), documents: toArray(categoryForm.documents), why: categoryForm.why.trim(), benefits: toArray(categoryForm.benefits), process: toArray(categoryForm.process), display_order: Number(categoryForm.display_order) || 0, enabled: categoryForm.enabled, updated_at: new Date().toISOString() };
      const result = editingCategory ? await supabase.from("service_categories").update(payload).eq("id", editingCategory.id) : await supabase.from("service_categories").insert(payload);
      if (result.error) throw result.error;
    },
    onSuccess: async () => { await invalidate(); setNotice(editingCategory ? "Category updated." : "Category created."); closeEditors(); },
    onError: (e: Error) => setErrorText(e.message),
  });
  const saveService = useMutation({
    mutationFn: async () => {
      const title = serviceForm.title.trim(); const slug = slugify(serviceForm.slug || title);
      if (!title || !slug || !serviceForm.category_slug) throw new Error("Choose a category and enter a service title and valid slug.");
      if (!serviceForm.short_description.trim()) throw new Error("Enter a short description for the service card.");
      const payload = { category_slug: serviceForm.category_slug, title, slug, short_description: serviceForm.short_description.trim(), full_description: serviceForm.full_description.trim(), who_needs: toArray(serviceForm.who_needs), help_with: toArray(serviceForm.help_with), documents: toArray(serviceForm.documents), availability: serviceForm.availability, display_order: Number(serviceForm.display_order) || 0, enabled: serviceForm.enabled, updated_at: new Date().toISOString() };
      const result = editingService ? await supabase.from("services").update(payload).eq("id", editingService.id) : await supabase.from("services").insert(payload);
      if (result.error) throw result.error;
    },
    onSuccess: async () => { await invalidate(); setNotice(editingService ? "Service updated." : "Service created."); closeEditors(); },
    onError: (e: Error) => setErrorText(e.message),
  });
  const toggle = useMutation({
    mutationFn: async ({ kind, row }: { kind: "category" | "service"; row: Category | Service }) => {
      const table = kind === "category" ? "service_categories" : "services";
      const { error } = await supabase.from(table).update({ enabled: !row.enabled, updated_at: new Date().toISOString() }).eq("id", row.id);
      if (error) throw error;
    }, onSuccess: async () => { await invalidate(); setNotice("Publication status updated."); }, onError: (e: Error) => setNotice(e.message),
  });
  const remove = useMutation({
    mutationFn: async () => {
      if (!deleteTarget) return;
      const table = deleteTarget.kind === "category" ? "service_categories" : "services";
      const { error } = await supabase.from(table).delete().eq("id", deleteTarget.row.id);
      if (error) throw error;
    }, onSuccess: async () => { await invalidate(); setDeleteTarget(null); setNotice("Item deleted."); }, onError: (e: Error) => setNotice(e.message),
  });

  const updateCategory = <K extends keyof CategoryForm>(k: K, v: CategoryForm[K]) => setCategoryForm((p) => ({ ...p, [k]: v }));
  const updateService = <K extends keyof ServiceForm>(k: K, v: ServiceForm[K]) => setServiceForm((p) => ({ ...p, [k]: v }));
  const loading = categoriesQuery.isLoading || servicesQuery.isLoading;
  const queryError = categoriesQuery.error || servicesQuery.error;

  return <div className="space-y-7">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#B7792B]"><BriefcaseBusiness size={16}/><span>Website Content</span></div><h1 className="text-2xl font-bold tracking-tight text-[#243653] sm:text-3xl">Services Management</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Manage the eight public practice areas and the individual services shown inside each category, including their detail-page content.</p></div>
      <button onClick={tab === "categories" ? openNewCategory : openNewService} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1b2940]"><Plus size={17}/>{tab === "categories" ? "Add Category" : "Add Service"}</button>
    </div>
    {notice && <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"><div className="flex items-center gap-2"><CheckCircle2 size={17} className="text-green-600"/><span>{notice}</span></div><button onClick={() => setNotice("")} aria-label="Dismiss"><X size={16}/></button></div>}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[{ label: "Practice Areas", value: categories.length, icon: FolderOpen }, { label: "Total Services", value: services.length, icon: BriefcaseBusiness }, { label: "Published", value: publishedServices, icon: Eye }, { label: "Hidden", value: hiddenServices, icon: EyeOff }].map((x) => { const Icon = x.icon; return <div key={x.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-slate-500 sm:text-sm">{x.label}</p><Icon size={18} className="text-[#B7792B]"/></div><p className="mt-3 text-2xl font-bold text-[#243653]">{x.value}</p></div>; })}
    </div>
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200">
      <button onClick={() => { setTab("services"); setSearch(""); }} className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${tab === "services" ? "border-[#B7792B] text-[#243653]" : "border-transparent text-slate-500 hover:text-slate-800"}`}><Layers3 size={16}/>Individual Services</button>
      <button onClick={() => { setTab("categories"); setSearch(""); }} className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${tab === "categories" ? "border-[#B7792B] text-[#243653]" : "border-transparent text-slate-500 hover:text-slate-800"}`}><FolderOpen size={16}/>Practice Areas / Categories</button>
    </div>
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
      <div className="relative flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tab === "services" ? "Search services by title, slug or description..." : "Search practice areas..."} className={`${field} pl-10`}/></div>
      {tab === "services" && <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={`${field} sm:max-w-xs`}><option value="all">All practice areas</option>{categories.map((c) => <option key={c.id} value={c.slug}>{c.letter}. {c.title}</option>)}</select>}
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"><option value="all">All statuses</option><option value="published">Published</option><option value="hidden">Hidden</option></select>
    </div>
    {loading ? <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500"><Loader2 size={18} className="animate-spin"/>Loading services content...</div> : queryError ? <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><AlertCircle className="mb-2" size={20}/><p className="font-semibold">Could not load services content</p><p className="mt-1">{(queryError as Error).message}</p><button onClick={() => { categoriesQuery.refetch(); servicesQuery.refetch(); }} className="mt-3 rounded-lg border border-red-200 px-3 py-2">Try again</button></div> : tab === "categories" ? <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold text-[#243653]">Practice Areas</h2><p className="mt-1 text-xs text-slate-500">{filteredCategories.length} categories · ordered as displayed on /services</p></div><ArrowUpDown size={16} className="text-slate-400"/></div>{filteredCategories.length ? <div className="divide-y divide-slate-100">{filteredCategories.map((c) => <div key={c.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#243653]/5 font-serif text-lg font-semibold text-[#243653]">{c.letter}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-[#243653]">{c.title}</h3><Status enabled={c.enabled}/></div><p className="mt-1 text-xs text-slate-400">/{c.slug} · Icon: {c.icon || "BriefcaseBusiness"}</p><p className="mt-2 line-clamp-2 text-sm text-slate-500">{c.summary || c.note || "No category summary added yet."}</p><p className="mt-2 text-xs text-slate-400">Display order: {c.display_order} · {services.filter((s) => s.category_slug === c.slug).length} services</p></div><Actions enabled={c.enabled} onToggle={() => toggle.mutate({ kind: "category", row: c })} onEdit={() => openEditCategory(c)} onDelete={() => setDeleteTarget({ kind: "category", row: c })}/></div>)}</div> : <Empty title="No practice areas found" text="Add your first category to organize the public services page." onAdd={openNewCategory}/>}</div> : <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold text-[#243653]">Service Collection</h2><p className="mt-1 text-xs text-slate-500">{filteredServices.length} services found</p></div><ArrowUpDown size={16} className="text-slate-400"/></div>{filteredServices.length ? <div className="divide-y divide-slate-100">{filteredServices.map((s) => { const cat = categories.find((c) => c.slug === s.category_slug); return <div key={s.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#243653]/5 text-[#243653]"><BriefcaseBusiness size={21}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-[#243653]">{s.title}</h3><Status enabled={s.enabled}/></div><p className="mt-1 text-xs text-[#B7792B]">{cat ? `${cat.letter}. ${cat.title}` : `Unassigned · ${s.category_slug || "no category"}`}</p><p className="mt-1 text-xs text-slate-400">/{s.slug}</p><p className="mt-2 line-clamp-2 text-sm text-slate-500">{s.short_description || "No short description provided."}</p><p className="mt-2 text-xs text-slate-400">Order: {s.display_order} · {s.who_needs?.length ?? 0} audience items · {s.documents?.length ?? 0} document items · {s.availability || "Contact for availability"}</p></div><Actions enabled={s.enabled} onToggle={() => toggle.mutate({ kind: "service", row: s })} onEdit={() => openEditService(s)} onDelete={() => setDeleteTarget({ kind: "service", row: s })}/></div>; })}</div> : <Empty title="No services found" text="Add a service and assign it to one of the practice areas." onAdd={openNewService}/>}</div>}
    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><AlertCircle size={16} className="mt-0.5 shrink-0"/><p><strong>Public website integration:</strong> your current public routes still read category structure from <code>src/content/catalog</code> through <code>useCatalog()</code>. Saving here updates Supabase, but the public /services, category and service-detail pages will reflect these edits only after those routes are connected to the new CMS tables.</p></div>

    {categoryEditor && <Modal title={editingCategory ? "Edit Practice Area" : "Add Practice Area"} subtitle="These fields control the category heading, overview page and sidebar content." onClose={closeEditors}>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Category title *"><input className={field} value={categoryForm.title} onChange={(e) => { const v = e.target.value; setCategoryForm((p) => ({ ...p, title: v, slug: editingCategory ? p.slug : slugify(v) })); }} placeholder="e.g. Taxation Services"/></Field><Field label="URL slug *"><input className={field} value={categoryForm.slug} onChange={(e) => updateCategory("slug", slugify(e.target.value))} placeholder="taxation-services"/></Field><Field label="Category letter"><input className={field} maxLength={1} value={categoryForm.letter} onChange={(e) => updateCategory("letter", e.target.value.toUpperCase())}/></Field><Field label="Icon name"><input className={field} value={categoryForm.icon} onChange={(e) => updateCategory("icon", e.target.value)} placeholder="Landmark / BriefcaseBusiness"/></Field></div>
      <Field label="Category summary"><textarea className={field} rows={3} value={categoryForm.summary} onChange={(e) => updateCategory("summary", e.target.value)} placeholder="Short introduction for the category overview page..."/></Field>
      <Field label="Category notice / note"><textarea className={field} rows={2} value={categoryForm.note} onChange={(e) => updateCategory("note", e.target.value)} placeholder="Optional notice shown above the category services..."/></Field>
      <Field label="Why this practice area matters"><textarea className={field} rows={3} value={categoryForm.why} onChange={(e) => updateCategory("why", e.target.value)}/></Field>
      <div className="grid gap-4 sm:grid-cols-2"><LinesField label="Relevant authorities" value={categoryForm.authority} onChange={(v) => updateCategory("authority", v)} placeholder="National Board of Revenue (NBR)"/><LinesField label="Who needs this practice area?" value={categoryForm.who_needs} onChange={(v) => updateCategory("who_needs", v)} placeholder="Individuals"/><LinesField label="Documents" value={categoryForm.documents} onChange={(v) => updateCategory("documents", v)} placeholder="National ID"/><LinesField label="Key benefits" value={categoryForm.benefits} onChange={(v) => updateCategory("benefits", v)} placeholder="Clear compliance guidance"/></div>
      <LinesField label="Step-by-step process" value={categoryForm.process} onChange={(v) => updateCategory("process", v)} placeholder="Initial consultation"/>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Display order"><input type="number" className={field} value={categoryForm.display_order} onChange={(e) => updateCategory("display_order", e.target.value)}/></Field><PublishToggle checked={categoryForm.enabled} onChange={(v) => updateCategory("enabled", v)}/></div>
      <FormError value={errorText}/><ModalFooter onCancel={closeEditors} onSave={() => { setErrorText(""); saveCategory.mutate(); }} busy={saveCategory.isPending} saveLabel={editingCategory ? "Save Category" : "Create Category"}/>
    </Modal>}

    {serviceEditor && <Modal title={editingService ? "Edit Service" : "Add Service"} subtitle="Manage the service card and the information used on its detail page." onClose={closeEditors}>
      <Field label="Practice area / category *"><select className={field} value={serviceForm.category_slug} onChange={(e) => updateService("category_slug", e.target.value)}><option value="">Select a category</option>{categories.map((c) => <option key={c.id} value={c.slug}>{c.letter}. {c.title}</option>)}</select></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Service title *"><input className={field} value={serviceForm.title} onChange={(e) => { const v = e.target.value; setServiceForm((p) => ({ ...p, title: v, slug: editingService ? p.slug : slugify(v) })); }} placeholder="e.g. Corporate Income Tax Consultancy"/></Field><Field label="URL slug *"><input className={field} value={serviceForm.slug} onChange={(e) => updateService("slug", slugify(e.target.value))} placeholder="corporate-income-tax-consultancy"/></Field></div>
      <Field label="Short description *"><textarea className={field} rows={3} value={serviceForm.short_description} onChange={(e) => updateService("short_description", e.target.value)} placeholder="Shown on the service card and used as the introductory summary..."/></Field>
      <Field label="Full description"><textarea className={field} rows={5} value={serviceForm.full_description} onChange={(e) => updateService("full_description", e.target.value)} placeholder="Detailed description for the What is this service? section..."/></Field>
      <div className="grid gap-4 sm:grid-cols-2"><LinesField label="Who needs this service?" value={serviceForm.who_needs} onChange={(v) => updateService("who_needs", v)} placeholder="Companies"/><LinesField label="How we help" value={serviceForm.help_with} onChange={(v) => updateService("help_with", v)} placeholder="Tax return preparation"/></div>
      <LinesField label="Documents that may be required" value={serviceForm.documents} onChange={(v) => updateService("documents", v)} placeholder="Trade license"/>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Availability label"><select className={field} value={serviceForm.availability} onChange={(e) => updateService("availability", e.target.value)}><option>Contact for availability</option><option>Available</option><option>By consultation</option><option>Currently unavailable</option></select></Field><Field label="Display order"><input type="number" className={field} value={serviceForm.display_order} onChange={(e) => updateService("display_order", e.target.value)}/></Field></div>
      <PublishToggle checked={serviceForm.enabled} onChange={(v) => updateService("enabled", v)}/><FormError value={errorText}/><ModalFooter onCancel={closeEditors} onSave={() => { setErrorText(""); saveService.mutate(); }} busy={saveService.isPending} saveLabel={editingService ? "Save Service" : "Create Service"}/>
    </Modal>}

    {deleteTarget && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 size={22}/></div><h2 className="mt-4 text-lg font-semibold text-[#243653]">Delete this {deleteTarget.kind === "category" ? "category" : "service"}?</h2><p className="mt-2 text-sm leading-6 text-slate-500">Delete <strong>{deleteTarget.row.title}</strong>? This cannot be undone. If you delete a category, check the database migration's foreign-key behavior before doing so.</p><div className="mt-6 flex justify-end gap-2"><button onClick={() => setDeleteTarget(null)} className="rounded-lg border px-4 py-2.5 text-sm">Cancel</button><button onClick={() => remove.mutate()} disabled={remove.isPending} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm text-white disabled:opacity-60">{remove.isPending && <Loader2 size={15} className="animate-spin"/>}Delete</button></div></div></div>}
  </div>;
}

function Status({ enabled }: { enabled: boolean }) { return <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${enabled ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>{enabled ? "Published" : "Hidden"}</span>; }
function Actions({ enabled, onToggle, onEdit, onDelete }: { enabled: boolean; onToggle: () => void; onEdit: () => void; onDelete: () => void }) { return <div className="flex items-center gap-2 sm:justify-end"><button onClick={onToggle} title={enabled ? "Hide" : "Publish"} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-[#B7792B]">{enabled ? <EyeOff size={16}/> : <Eye size={16}/>}</button><button onClick={onEdit} title="Edit" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-[#B7792B]"><Pencil size={16}/></button><button onClick={onDelete} title="Delete" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16}/></button></div>; }
function Empty({ title, text, onAdd }: { title: string; text: string; onAdd: () => void }) { return <div className="flex flex-col items-center px-5 py-14 text-center"><BriefcaseBusiness size={28} className="text-slate-400"/><h3 className="mt-3 font-semibold text-[#243653]">{title}</h3><p className="mt-1 text-sm text-slate-500">{text}</p><button onClick={onAdd} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#243653] px-4 py-2 text-sm text-white"><Plus size={16}/>Add new</button></div>; }
function Field({ label: name, children }: { label: string; children: ReactNode }) { return <div><label className={label}>{name}</label>{children}</div>; }
function LinesField({ label: name, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) { return <Field label={name}><textarea className={field} rows={4} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}/><p className="mt-1 text-xs text-slate-400">One item per line.</p></Field>; }
function PublishToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) { return <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4"><span><span className="block text-sm font-medium text-[#243653]">Publish on website</span><span className="mt-1 block text-xs text-slate-500">Hidden items remain available in this dashboard.</span></span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#243653]"/></label>; }
function FormError({ value }: { value: string }) { return value ? <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={17} className="mt-0.5 shrink-0"/><span>{value}</span></div> : null; }
function Modal({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: ReactNode }) { return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"><div className="my-auto w-full max-w-3xl rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b px-5 py-4 sm:px-6"><div><h2 className="text-lg font-semibold text-[#243653]">{title}</h2><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div><button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={19}/></button></div><div className="max-h-[72vh] space-y-5 overflow-y-auto p-5 sm:p-6">{children}</div></div></div>; }
function ModalFooter({ onCancel, onSave, busy, saveLabel }: { onCancel: () => void; onSave: () => void; busy: boolean; saveLabel: string }) { return <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end"><button onClick={onCancel} disabled={busy} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600">Cancel</button><button onClick={onSave} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">{busy && <Loader2 size={16} className="animate-spin"/>}{saveLabel}</button></div>; }
