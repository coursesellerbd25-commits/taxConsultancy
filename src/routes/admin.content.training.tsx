import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FileUp,
  GraduationCap,
  Link as LinkIcon,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/content/training")({
  component: TrainingPage,
});

const BUCKET = "training-materials";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#B7792B] focus:ring-2 focus:ring-[#B7792B]/10";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";
const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2940] disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60";

 type TrainingProgram = {
  id: string;
  title: string;
  slug: string;
  description: string;
  audience: string;
  learning_objectives: string[];
  syllabus: string[];
  instructor: string;
  duration: string;
  fee: string;
  schedule: string;
  certificate: string;
  enrollment_url: string | null;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

type TrainingMaterial = {
  id: string;
  program_id: string | null;
  title: string;
  description: string;
  category: string;
  file_url: string | null;
  file_name: string | null;
  external_url: string | null;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

type TrainingPageSettings = {
  id: number;
  student_journey: string[];
  cta_title: string;
  cta_text: string;
  updated_at: string;
};

type ProgramForm = {
  title: string;
  slug: string;
  description: string;
  audience: string;
  learning_objectives: string;
  syllabus: string;
  instructor: string;
  duration: string;
  fee: string;
  schedule: string;
  certificate: string;
  enrollment_url: string;
  display_order: string;
  enabled: boolean;
};

type MaterialForm = {
  program_id: string;
  title: string;
  description: string;
  category: string;
  external_url: string;
  display_order: string;
  enabled: boolean;
};

const emptyProgramForm: ProgramForm = {
  title: "", slug: "", description: "", audience: "",
  learning_objectives: "", syllabus: "", instructor: "",
  duration: "", fee: "", schedule: "", certificate: "",
  enrollment_url: "", display_order: "0", enabled: true,
};
const emptyMaterialForm: MaterialForm = {
  program_id: "", title: "", description: "", category: "General",
  external_url: "", display_order: "0", enabled: true,
};
const defaultJourney = [
  "Enquire", "Register", "Confirm admission", "Start learning",
  "Complete course", "Certificate (if applicable)",
];
const emptySettings: TrainingPageSettings = {
  id: 1, student_journey: defaultJourney,
  cta_title: "Interested in a course?",
  cta_text: "Send an enquiry and we will share the next available batch.",
  updated_at: "",
};

const slugify = (value: string) => value.toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const linesToArray = (value: string) => value.split("\n").map((v) => v.trim()).filter(Boolean);
const arrayToLines = (value: string[] | null | undefined) => Array.isArray(value) ? value.join("\n") : "";
const validHttpUrl = (value: string) => {
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol); }
  catch { return false; }
};

function TrainingPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"programs" | "journey" | "materials">("programs");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showProgramEditor, setShowProgramEditor] = useState(false);
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null);
  const [programForm, setProgramForm] = useState<ProgramForm>(emptyProgramForm);
  const [showMaterialEditor, setShowMaterialEditor] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<TrainingMaterial | null>(null);
  const [materialForm, setMaterialForm] = useState<MaterialForm>(emptyMaterialForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeCurrentFile, setRemoveCurrentFile] = useState(false);
  const [journeyDraft, setJourneyDraft] = useState("");
  const [ctaTitle, setCtaTitle] = useState(emptySettings.cta_title);
  const [ctaText, setCtaText] = useState(emptySettings.cta_text);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const programsQuery = useQuery({
    queryKey: ["admin-training-programs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("training_programs").select("*")
        .order("display_order", { ascending: true }).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TrainingProgram[];
    },
  });
  const materialsQuery = useQuery({
    queryKey: ["admin-training-materials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("training_materials").select("*")
        .order("display_order", { ascending: true }).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TrainingMaterial[];
    },
  });
  const settingsQuery = useQuery({
    queryKey: ["admin-training-page-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("training_page_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return (data as TrainingPageSettings | null) ?? emptySettings;
    },
  });

  const programs = programsQuery.data ?? [];
  const materials = materialsQuery.data ?? [];
  const settings = settingsQuery.data ?? emptySettings;
  const publishedPrograms = programs.filter((p) => p.enabled).length;
  const publishedMaterials = materials.filter((m) => m.enabled).length;
  const filteredPrograms = programs.filter((p) => {
    const q = search.toLowerCase();
    const match = [p.title, p.slug, p.description, p.audience].some((v) => (v ?? "").toLowerCase().includes(q));
    return match && (statusFilter === "all" || (statusFilter === "published" && p.enabled) || (statusFilter === "hidden" && !p.enabled));
  });
  const filteredMaterials = materials.filter((m) => {
    const q = search.toLowerCase();
    const match = [m.title, m.description, m.category, m.file_name ?? ""].some((v) => (v ?? "").toLowerCase().includes(q));
    return match && (statusFilter === "all" || (statusFilter === "published" && m.enabled) || (statusFilter === "hidden" && !m.enabled));
  });
  const isLoading = programsQuery.isLoading || materialsQuery.isLoading || settingsQuery.isLoading;
  const hasError = programsQuery.isError || materialsQuery.isError || settingsQuery.isError;

  const invalidateTraining = async () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ["admin-training-programs"] }),
    queryClient.invalidateQueries({ queryKey: ["admin-training-materials"] }),
    queryClient.invalidateQueries({ queryKey: ["admin-training-page-settings"] }),
    queryClient.invalidateQueries({ queryKey: ["public-training-programs"] }),
    queryClient.invalidateQueries({ queryKey: ["public-training-materials"] }),
    queryClient.invalidateQueries({ queryKey: ["public-training-page-settings"] }),
  ]);

  const resetProgramEditor = () => { setShowProgramEditor(false); setEditingProgram(null); setProgramForm(emptyProgramForm); setFormError(""); };
  const resetMaterialEditor = () => {
    setShowMaterialEditor(false); setEditingMaterial(null); setMaterialForm(emptyMaterialForm);
    setSelectedFile(null); setRemoveCurrentFile(false); setFormError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const openNewProgram = () => { setEditingProgram(null); setProgramForm(emptyProgramForm); setFormError(""); setShowProgramEditor(true); };
  const openEditProgram = (p: TrainingProgram) => {
    setEditingProgram(p);
    setProgramForm({
      title: p.title, slug: p.slug, description: p.description ?? "", audience: p.audience ?? "",
      learning_objectives: arrayToLines(p.learning_objectives), syllabus: arrayToLines(p.syllabus),
      instructor: p.instructor ?? "", duration: p.duration ?? "", fee: p.fee ?? "",
      schedule: p.schedule ?? "", certificate: p.certificate ?? "", enrollment_url: p.enrollment_url ?? "",
      display_order: String(p.display_order ?? 0), enabled: p.enabled,
    });
    setFormError(""); setShowProgramEditor(true);
  };
  const openNewMaterial = () => { setEditingMaterial(null); setMaterialForm(emptyMaterialForm); setSelectedFile(null); setRemoveCurrentFile(false); setFormError(""); setShowMaterialEditor(true); };
  const openEditMaterial = (m: TrainingMaterial) => {
    setEditingMaterial(m);
    setMaterialForm({ program_id: m.program_id ?? "", title: m.title, description: m.description ?? "", category: m.category ?? "General", external_url: m.external_url ?? "", display_order: String(m.display_order ?? 0), enabled: m.enabled });
    setSelectedFile(null); setRemoveCurrentFile(false); setFormError(""); setShowMaterialEditor(true);
  };

  const saveProgramMutation = useMutation({
    mutationFn: async () => {
      const title = programForm.title.trim();
      const slug = slugify(programForm.slug || programForm.title);
      if (!title || !slug) throw new Error("Enter a course title and valid URL slug.");
      if (programForm.enrollment_url.trim() && !validHttpUrl(programForm.enrollment_url.trim())) throw new Error("Enter a valid enrolment URL.");
      const payload = {
        title, slug, description: programForm.description.trim(), audience: programForm.audience.trim(),
        learning_objectives: linesToArray(programForm.learning_objectives), syllabus: linesToArray(programForm.syllabus),
        instructor: programForm.instructor.trim(), duration: programForm.duration.trim(), fee: programForm.fee.trim(),
        schedule: programForm.schedule.trim(), certificate: programForm.certificate.trim(),
        enrollment_url: programForm.enrollment_url.trim() || null,
        display_order: Number(programForm.display_order) || 0, enabled: programForm.enabled, updated_at: new Date().toISOString(),
      };
      const result = editingProgram
        ? await supabase.from("training_programs").update(payload).eq("id", editingProgram.id)
        : await supabase.from("training_programs").insert(payload);
      if (result.error) throw result.error;
    },
    onSuccess: async () => { await invalidateTraining(); setNotice(editingProgram ? "Course updated." : "Course created."); resetProgramEditor(); },
    onError: (e: Error) => setFormError(e.message),
  });

  const toggleProgramMutation = useMutation({
    mutationFn: async (p: TrainingProgram) => {
      const { error } = await supabase.from("training_programs").update({ enabled: !p.enabled, updated_at: new Date().toISOString() }).eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: async () => { await invalidateTraining(); setNotice("Course visibility updated."); },
    onError: (e: Error) => setNotice(e.message),
  });
  const deleteProgramMutation = useMutation({
    mutationFn: async (p: TrainingProgram) => {
      const { error } = await supabase.from("training_programs").delete().eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: async () => { await invalidateTraining(); setNotice("Course deleted. Related materials are now unassigned."); },
    onError: (e: Error) => setNotice(e.message),
  });

  const uploadMaterialFile = async (file: File) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  };
  const saveMaterialMutation = useMutation({
    mutationFn: async () => {
      const title = materialForm.title.trim();
      const url = materialForm.external_url.trim();
      if (!title) throw new Error("Enter a material title.");
      if (url && !validHttpUrl(url)) throw new Error("Enter a valid external URL.");
      if (!selectedFile && !url && !editingMaterial?.file_url) throw new Error("Upload a file or provide an external URL.");
      let fileUrl = editingMaterial?.file_url ?? null;
      let fileName = editingMaterial?.file_name ?? null;
      if (selectedFile) { fileUrl = await uploadMaterialFile(selectedFile); fileName = selectedFile.name; }
      if (removeCurrentFile) { fileUrl = null; fileName = null; }
      const payload = {
        program_id: materialForm.program_id || null, title, description: materialForm.description.trim(),
        category: materialForm.category.trim() || "General", file_url: fileUrl, file_name: fileName,
        external_url: url || null, display_order: Number(materialForm.display_order) || 0,
        enabled: materialForm.enabled, updated_at: new Date().toISOString(),
      };
      const result = editingMaterial
        ? await supabase.from("training_materials").update(payload).eq("id", editingMaterial.id)
        : await supabase.from("training_materials").insert(payload);
      if (result.error) throw result.error;
      if (editingMaterial?.file_url && (selectedFile || removeCurrentFile)) {
        const oldPath = editingMaterial.file_url.split(`/${BUCKET}/`)[1];
        if (oldPath) {
          const { error } = await supabase.storage.from(BUCKET).remove([oldPath]);
          if (error) throw new Error(`Material saved, but old file cleanup failed: ${error.message}`);
        }
      }
    },
    onSuccess: async () => { await invalidateTraining(); setNotice(editingMaterial ? "Material updated." : "Material added."); resetMaterialEditor(); },
    onError: (e: Error) => setFormError(e.message),
  });
  const toggleMaterialMutation = useMutation({
    mutationFn: async (m: TrainingMaterial) => {
      const { error } = await supabase.from("training_materials").update({ enabled: !m.enabled, updated_at: new Date().toISOString() }).eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: async () => { await invalidateTraining(); setNotice("Material visibility updated."); },
    onError: (e: Error) => setNotice(e.message),
  });
  const deleteMaterialMutation = useMutation({
    mutationFn: async (m: TrainingMaterial) => {
      const { error } = await supabase.from("training_materials").delete().eq("id", m.id);
      if (error) throw error;
      if (m.file_url) {
        const path = m.file_url.split(`/${BUCKET}/`)[1];
        if (path) {
          const { error: storageError } = await supabase.storage.from(BUCKET).remove([path]);
          if (storageError) throw new Error(`Material deleted, but file cleanup failed: ${storageError.message}`);
        }
      }
    },
    onSuccess: async () => { await invalidateTraining(); setNotice("Material deleted."); },
    onError: (e: Error) => setNotice(e.message),
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      const journey = linesToArray(journeyDraft);
      if (journey.length === 0) throw new Error("Add at least one student journey step.");
      if (!ctaTitle.trim() || !ctaText.trim()) throw new Error("CTA title and description are required.");
      const { error } = await supabase.from("training_page_settings").upsert({
        id: 1, student_journey: journey, cta_title: ctaTitle.trim(), cta_text: ctaText.trim(), updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: async () => { await invalidateTraining(); setNotice("Training page sections updated."); },
    onError: (e: Error) => setNotice(e.message),
  });

  const handleFileChange = (file?: File) => {
    setFormError("");
    if (!file) { setSelectedFile(null); return; }
    if (!allowedTypes.includes(file.type)) { setFormError("Unsupported file. Use PDF, DOC, DOCX, PPT, PPTX, XLS, or XLSX."); return; }
    if (file.size > MAX_FILE_SIZE) { setFormError("File size must be 10 MB or smaller."); return; }
    setSelectedFile(file); setRemoveCurrentFile(false);
  };
  const changeTab = (tab: "programs" | "journey" | "materials") => {
    setActiveTab(tab); setSearch(""); setStatusFilter("all"); setNotice("");
    if (tab === "journey") {
      setJourneyDraft(arrayToLines(settings.student_journey));
      setCtaTitle(settings.cta_title);
      setCtaText(settings.cta_text);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#B7792B]"><GraduationCap size={17} /><span>Website Content</span></div>
          <h1 className="text-2xl font-bold tracking-tight text-[#243653] sm:text-3xl">Training & Courses</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Manage the public course catalogue, course detail pages, student journey, enrolment call-to-action and learning materials.</p>
        </div>
        {activeTab !== "journey" && (
          <button type="button" onClick={activeTab === "programs" ? openNewProgram : openNewMaterial} className={primaryButton}>
            <Plus size={17} />{activeTab === "programs" ? "Add Course" : "Add Material"}
          </button>
        )}
      </div>

      {notice && <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"><div className="flex items-center gap-2"><CheckCircle2 size={17} className="shrink-0 text-green-600" /><span>{notice}</span></div><button type="button" onClick={() => setNotice("")} aria-label="Dismiss notice"><X size={16} /></button></div>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total Courses", value: programs.length, icon: GraduationCap },
          { label: "Published Courses", value: publishedPrograms, icon: Eye },
          { label: "Learning Materials", value: materials.length, icon: BookOpen },
          { label: "Published Materials", value: publishedMaterials, icon: FileText },
        ].map((item) => { const Icon = item.icon; return <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-slate-500 sm:text-sm">{item.label}</p><Icon size={18} className="text-[#B7792B]" /></div><p className="mt-3 text-2xl font-bold text-[#243653]">{item.value}</p></div>; })}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {([
          ["programs", GraduationCap, "Courses", programs.length],
          ["journey", Users, "Student Journey & CTA", null],
          ["materials", BookOpen, "Learning Materials", materials.length],
        ] as const).map(([tab, Icon, title, count]) => (
          <button key={tab} type="button" onClick={() => changeTab(tab)} className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === tab ? "border-[#B7792B] text-[#243653]" : "border-transparent text-slate-500 hover:text-[#243653]"}`}>
            <Icon size={17} />{title}{count !== null && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{count}</span>}
          </button>
        ))}
      </div>

      {activeTab === "journey" ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="max-w-3xl"><h2 className="text-lg font-semibold text-[#243653]">Training page sections</h2><p className="mt-1 text-sm text-slate-500">Edit the six-step journey and the call-to-action shown below the course catalogue on the public Training page.</p></div>
          <div className="mt-6 space-y-5">
            <div><label className={labelClass}>Student journey steps</label><textarea rows={7} value={journeyDraft || arrayToLines(settings.student_journey)} onChange={(e) => setJourneyDraft(e.target.value)} className={inputClass} placeholder="Enter one step per line" /><p className="mt-1 text-xs text-slate-400">One step per line. The public page numbers each step automatically.</p></div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className={labelClass}>CTA heading</label><input value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} className={inputClass} placeholder="Interested in a course?" /></div>
              <div><label className={labelClass}>CTA description</label><textarea rows={3} value={ctaText} onChange={(e) => setCtaText(e.target.value)} className={inputClass} placeholder="Send an enquiry..." /></div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview · Student journey</p><ol className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{linesToArray(journeyDraft || arrayToLines(settings.student_journey)).map((step, i) => <li key={`${step}-${i}`} className="border-t-2 border-[#B7792B] pt-2"><span className="font-serif text-xl text-[#B7792B]">{i + 1}</span><p className="mt-1 text-sm font-medium text-[#243653]">{step}</p></li>)}</ol><div className="mt-5 border-t border-slate-200 pt-4"><p className="font-semibold text-[#243653]">{ctaTitle}</p><p className="mt-1 text-sm text-slate-500">{ctaText}</p></div></div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"><p className="text-xs text-slate-400">These settings are stored separately from individual course records.</p><button type="button" onClick={() => saveSettingsMutation.mutate()} disabled={saveSettingsMutation.isPending} className={primaryButton}>{saveSettingsMutation.isPending && <Loader2 size={16} className="animate-spin" />}Save page sections</button></div>
          </div>
        </section>
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={activeTab === "programs" ? "Search courses by title, slug or audience..." : "Search learning materials..."} className={`${inputClass} pl-10`} /></div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputClass} sm:w-44`}><option value="all">All statuses</option><option value="published">Published</option><option value="hidden">Hidden</option></select>
          </div>
          {isLoading ? <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-16 text-sm text-slate-500"><Loader2 size={18} className="animate-spin" />Loading training content...</div> : hasError ? <div className="rounded-xl border border-red-200 bg-white p-8 text-center"><AlertCircle className="mx-auto text-red-500" size={28} /><h2 className="mt-3 font-semibold text-[#243653]">Unable to load training content</h2><p className="mt-2 text-sm text-slate-500">{programsQuery.error?.message || materialsQuery.error?.message || settingsQuery.error?.message}</p><button type="button" onClick={() => { programsQuery.refetch(); materialsQuery.refetch(); settingsQuery.refetch(); }} className={`${secondaryButton} mt-4`}>Try again</button></div> : activeTab === "programs" ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-[#243653]">Public course catalogue</h2><p className="mt-1 text-xs text-slate-500">{filteredPrograms.length} course{filteredPrograms.length === 1 ? "" : "s"} found · Course cards link to their detail pages.</p></div>
              {filteredPrograms.length === 0 ? <div className="px-5 py-16 text-center"><GraduationCap size={30} className="mx-auto text-slate-300" /><h3 className="mt-3 font-semibold text-[#243653]">No courses found</h3><p className="mt-1 text-sm text-slate-500">Add a course or adjust your search and filters.</p></div> : <div className="divide-y divide-slate-100">{filteredPrograms.map((p) => <article key={p.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-5"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#243653]/5 text-[#243653]"><GraduationCap size={23} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-[#243653]">{p.title}</h3><span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${p.enabled ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>{p.enabled ? "Published" : "Hidden"}</span></div><p className="mt-1 text-xs text-slate-400">/training/{p.slug}</p><p className="mt-2 line-clamp-2 text-sm text-slate-500">{p.description || "No course overview provided."}</p><div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">{p.audience && <span className="inline-flex items-center gap-1"><Users size={13} />{p.audience}</span>}{p.duration && <span className="inline-flex items-center gap-1"><Clock size={13} />{p.duration}</span>}{p.schedule && <span className="inline-flex items-center gap-1"><CalendarDays size={13} />{p.schedule}</span>}{p.fee && <span>Fee: {p.fee}</span>}<span>{p.learning_objectives?.length ?? 0} objectives</span><span>{p.syllabus?.length ?? 0} syllabus modules</span></div></div><div className="flex items-center gap-2"><a href={`/training/${p.slug}`} target="_blank" rel="noreferrer" title="Preview course" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-[#B7792B]"><ExternalLink size={16} /></a><button type="button" onClick={() => toggleProgramMutation.mutate(p)} disabled={toggleProgramMutation.isPending} title={p.enabled ? "Hide course" : "Publish course"} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-[#B7792B]">{p.enabled ? <EyeOff size={16} /> : <Eye size={16} />}</button><button type="button" onClick={() => openEditProgram(p)} title="Edit course" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-[#B7792B]"><Pencil size={16} /></button><button type="button" onClick={() => { if (window.confirm(`Delete “${p.title}”? Associated materials will become unassigned.`)) deleteProgramMutation.mutate(p); }} title="Delete course" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button></div></article>)}</div>}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-[#243653]">Learning materials library</h2><p className="mt-1 text-xs text-slate-500">{filteredMaterials.length} material{filteredMaterials.length === 1 ? "" : "s"} found · Attach documents or external links to courses.</p></div>
              {filteredMaterials.length === 0 ? <div className="px-5 py-16 text-center"><BookOpen size={30} className="mx-auto text-slate-300" /><h3 className="mt-3 font-semibold text-[#243653]">No learning materials found</h3><p className="mt-1 text-sm text-slate-500">Add a document or external learning link.</p></div> : <div className="divide-y divide-slate-100">{filteredMaterials.map((m) => { const program = programs.find((p) => p.id === m.program_id); return <article key={m.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#243653]/5 text-[#243653]">{m.file_url ? <FileText size={22} /> : <LinkIcon size={22} />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-[#243653]">{m.title}</h3><span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${m.enabled ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>{m.enabled ? "Published" : "Hidden"}</span></div><p className="mt-1 line-clamp-2 text-sm text-slate-500">{m.description || "No description provided."}</p><div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400"><span>{m.category}</span>{program && <span>{program.title}</span>}{m.file_name && <span className="max-w-[180px] truncate">{m.file_name}</span>}{!m.program_id && <span>General material</span>}</div></div><div className="flex flex-wrap items-center gap-2">{m.file_url && <a href={m.file_url} target="_blank" rel="noreferrer" className={`${secondaryButton} px-3 py-2 text-xs`}><Download size={14} />File</a>}{m.external_url && <a href={m.external_url} target="_blank" rel="noreferrer" className={`${secondaryButton} px-3 py-2 text-xs`}><ExternalLink size={14} />Link</a>}<button type="button" onClick={() => toggleMaterialMutation.mutate(m)} disabled={toggleMaterialMutation.isPending} title={m.enabled ? "Hide material" : "Publish material"} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-[#B7792B]">{m.enabled ? <EyeOff size={16} /> : <Eye size={16} />}</button><button type="button" onClick={() => openEditMaterial(m)} title="Edit material" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-[#B7792B]"><Pencil size={16} /></button><button type="button" onClick={() => { if (window.confirm(`Delete “${m.title}”?`)) deleteMaterialMutation.mutate(m); }} title="Delete material" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button></div></article>; })}</div>}
            </div>
          )}
        </>
      )}

      {showProgramEditor && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"><div className="my-auto w-full max-w-3xl rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="text-lg font-semibold text-[#243653]">{editingProgram ? "Edit Course" : "Add Course"}</h2><p className="mt-1 text-xs text-slate-500">These fields power the public course card and its detail page.</p></div><button type="button" onClick={resetProgramEditor} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close course editor"><X size={19} /></button></div>
        <div className="max-h-[72vh] space-y-5 overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass}>Course title *</label><input value={programForm.title} onChange={(e) => setProgramForm((p) => ({ ...p, title: e.target.value, slug: editingProgram ? p.slug : slugify(e.target.value) }))} className={inputClass} placeholder="Professional Taxation Training" /></div><div><label className={labelClass}>URL slug *</label><input value={programForm.slug} onChange={(e) => setProgramForm((p) => ({ ...p, slug: slugify(e.target.value) }))} className={inputClass} placeholder="professional-taxation" /><p className="mt-1 text-xs text-slate-400">Public URL: /training/{programForm.slug || "course-slug"}</p></div></div>
          <div><label className={labelClass}>Course overview</label><textarea rows={3} value={programForm.description} onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })} className={inputClass} placeholder="A short description shown on the course card and detail page." /></div>
          <div><label className={labelClass}>Who should join?</label><textarea rows={2} value={programForm.audience} onChange={(e) => setProgramForm({ ...programForm, audience: e.target.value })} className={inputClass} placeholder="Accountants, finance staff and students" /></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass}>Learning objectives</label><textarea rows={5} value={programForm.learning_objectives} onChange={(e) => setProgramForm({ ...programForm, learning_objectives: e.target.value })} className={inputClass} placeholder="One objective per line" /><p className="mt-1 text-xs text-slate-400">One objective per line.</p></div><div><label className={labelClass}>Syllabus / modules</label><textarea rows={5} value={programForm.syllabus} onChange={(e) => setProgramForm({ ...programForm, syllabus: e.target.value })} className={inputClass} placeholder="Overview of the tax system&#10;Heads of income&#10;Tax computation" /><p className="mt-1 text-xs text-slate-400">One module per line; order is preserved.</p></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass}>Instructor</label><input value={programForm.instructor} onChange={(e) => setProgramForm({ ...programForm, instructor: e.target.value })} className={inputClass} placeholder="Instructor name / profile" /></div><div><label className={labelClass}>Duration</label><input value={programForm.duration} onChange={(e) => setProgramForm({ ...programForm, duration: e.target.value })} className={inputClass} placeholder="e.g. 6 weeks" /></div><div><label className={labelClass}>Class schedule</label><input value={programForm.schedule} onChange={(e) => setProgramForm({ ...programForm, schedule: e.target.value })} className={inputClass} placeholder="e.g. Friday and Saturday" /></div><div><label className={labelClass}>Course fee</label><input value={programForm.fee} onChange={(e) => setProgramForm({ ...programForm, fee: e.target.value })} className={inputClass} placeholder="Enter confirmed fee or leave blank" /></div><div><label className={labelClass}>Certificate information</label><input value={programForm.certificate} onChange={(e) => setProgramForm({ ...programForm, certificate: e.target.value })} className={inputClass} placeholder="e.g. Certificate on completion / leave blank" /></div><div><label className={labelClass}>Enrollment URL</label><input type="url" value={programForm.enrollment_url} onChange={(e) => setProgramForm({ ...programForm, enrollment_url: e.target.value })} className={inputClass} placeholder="https://..." /></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass}>Display order</label><input type="number" value={programForm.display_order} onChange={(e) => setProgramForm({ ...programForm, display_order: e.target.value })} className={inputClass} /></div><label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4"><span><span className="block text-sm font-medium text-[#243653]">Publish course</span><span className="mt-1 block text-xs text-slate-500">Visible to public visitors when enabled.</span></span><input type="checkbox" checked={programForm.enabled} onChange={(e) => setProgramForm({ ...programForm, enabled: e.target.checked })} className="h-4 w-4 accent-[#243653]" /></label></div>
          {formError && <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span>{formError}</span></div>}
        </div><div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6"><button type="button" onClick={resetProgramEditor} disabled={saveProgramMutation.isPending} className={secondaryButton}>Cancel</button><button type="button" onClick={() => { setFormError(""); saveProgramMutation.mutate(); }} disabled={saveProgramMutation.isPending} className={primaryButton}>{saveProgramMutation.isPending && <Loader2 size={16} className="animate-spin" />}{editingProgram ? "Save Changes" : "Create Course"}</button></div></div></div>}

      {showMaterialEditor && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"><div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="text-lg font-semibold text-[#243653]">{editingMaterial ? "Edit Learning Material" : "Add Learning Material"}</h2><p className="mt-1 text-xs text-slate-500">Attach a file or external link to a course.</p></div><button type="button" onClick={resetMaterialEditor} aria-label="Close material editor"><X size={19} /></button></div>
        <div className="max-h-[72vh] space-y-5 overflow-y-auto p-5 sm:p-6"><div><label className={labelClass}>Material title *</label><input value={materialForm.title} onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })} className={inputClass} placeholder="Income Tax Training Slides" /></div><div><label className={labelClass}>Related course</label><select value={materialForm.program_id} onChange={(e) => setMaterialForm({ ...materialForm, program_id: e.target.value })} className={inputClass}><option value="">General material (no specific course)</option>{programs.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></div><div><label className={labelClass}>Description</label><textarea rows={3} value={materialForm.description} onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })} className={inputClass} /></div><div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass}>Category</label><input value={materialForm.category} onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })} className={inputClass} /></div><div><label className={labelClass}>Display order</label><input type="number" value={materialForm.display_order} onChange={(e) => setMaterialForm({ ...materialForm, display_order: e.target.value })} className={inputClass} /></div></div>
          <div><label className={labelClass}>Upload document</label><div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" onChange={(e) => handleFileChange(e.target.files?.[0])} className="block w-full text-sm" />{selectedFile && <p className="mt-2 text-xs text-slate-600">Selected: {selectedFile.name}</p>}{!selectedFile && editingMaterial?.file_name && !removeCurrentFile && <div className="mt-2 flex items-center justify-between text-xs"><span className="truncate">Current: {editingMaterial.file_name}</span><button type="button" onClick={() => setRemoveCurrentFile(true)} className="text-red-600">Remove</button></div>}{removeCurrentFile && <p className="mt-2 text-xs text-amber-700">Current file will be removed on save.</p>}<p className="mt-2 text-xs text-slate-400">PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX · Maximum 10 MB</p></div></div>
          <div><label className={labelClass}>External learning URL</label><input type="url" value={materialForm.external_url} onChange={(e) => setMaterialForm({ ...materialForm, external_url: e.target.value })} className={inputClass} placeholder="https://..." /></div><label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4"><span><span className="block text-sm font-medium text-[#243653]">Publish material</span><span className="mt-1 block text-xs text-slate-500">Visible when enabled and permitted by the public page.</span></span><input type="checkbox" checked={materialForm.enabled} onChange={(e) => setMaterialForm({ ...materialForm, enabled: e.target.checked })} className="h-4 w-4 accent-[#243653]" /></label>
          {formError && <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={17} /><span>{formError}</span></div>}
        </div><div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end"><button type="button" onClick={resetMaterialEditor} disabled={saveMaterialMutation.isPending} className={secondaryButton}>Cancel</button><button type="button" onClick={() => { setFormError(""); saveMaterialMutation.mutate(); }} disabled={saveMaterialMutation.isPending} className={primaryButton}>{saveMaterialMutation.isPending && <Loader2 size={16} className="animate-spin" />}{editingMaterial ? "Save Changes" : "Add Material"}</button></div></div></div>}
    </div>
  );
}
