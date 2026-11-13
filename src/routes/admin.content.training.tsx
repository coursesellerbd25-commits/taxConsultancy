
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  BookOpen,
  GraduationCap,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  FileText,
  FileUp,
  Link as LinkIcon,
  ExternalLink,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  Clock,
  Users,
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

type TrainingProgram = {
  id: string;
  title: string;
  slug: string;
  description: string;
  learning_objectives: string[];
  duration: string;
  fee: string;
  schedule: string;
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

type ProgramForm = {
  title: string;
  slug: string;
  description: string;
  learning_objectives: string;
  duration: string;
  fee: string;
  schedule: string;
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
  title: "",
  slug: "",
  description: "",
  learning_objectives: "",
  duration: "",
  fee: "",
  schedule: "",
  enrollment_url: "",
  display_order: "0",
  enabled: true,
};

const emptyMaterialForm: MaterialForm = {
  program_id: "",
  title: "",
  description: "",
  category: "General",
  external_url: "",
  display_order: "0",
  enabled: true,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const linesToArray = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const arrayToLines = (value: string[] | null | undefined) =>
  Array.isArray(value) ? value.join("\n") : "";

function TrainingPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"programs" | "materials">(
    "programs"
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showProgramEditor, setShowProgramEditor] = useState(false);
  const [editingProgram, setEditingProgram] =
    useState<TrainingProgram | null>(null);
  const [programForm, setProgramForm] =
    useState<ProgramForm>(emptyProgramForm);

  const [showMaterialEditor, setShowMaterialEditor] = useState(false);
  const [editingMaterial, setEditingMaterial] =
    useState<TrainingMaterial | null>(null);
  const [materialForm, setMaterialForm] =
    useState<MaterialForm>(emptyMaterialForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeCurrentFile, setRemoveCurrentFile] = useState(false);

  const [deleteProgram, setDeleteProgram] =
    useState<TrainingProgram | null>(null);
  const [deleteMaterial, setDeleteMaterial] =
    useState<TrainingMaterial | null>(null);

  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const programsQuery = useQuery({
    queryKey: ["admin-training-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_programs")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as TrainingProgram[];
    },
  });

  const materialsQuery = useQuery({
    queryKey: ["admin-training-materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_materials")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as TrainingMaterial[];
    },
  });

  const programs = programsQuery.data ?? [];
  const materials = materialsQuery.data ?? [];

  const publishedPrograms = programs.filter((item) => item.enabled).length;
  const publishedMaterials = materials.filter((item) => item.enabled).length;

  const filteredPrograms = programs.filter((program) => {
    const term = search.toLowerCase();

    const matchesSearch =
      program.title.toLowerCase().includes(term) ||
      program.slug.toLowerCase().includes(term) ||
      program.description.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && program.enabled) ||
      (statusFilter === "hidden" && !program.enabled);

    return matchesSearch && matchesStatus;
  });

  const filteredMaterials = materials.filter((material) => {
    const term = search.toLowerCase();

    const matchesSearch =
      material.title.toLowerCase().includes(term) ||
      material.description.toLowerCase().includes(term) ||
      material.category.toLowerCase().includes(term) ||
      (material.file_name ?? "").toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && material.enabled) ||
      (statusFilter === "hidden" && !material.enabled);

    return matchesSearch && matchesStatus;
  });

  const invalidateTraining = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["admin-training-programs"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["admin-training-materials"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["public-training-programs"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["public-training-materials"],
      }),
    ]);
  };

  const resetProgramEditor = () => {
    setShowProgramEditor(false);
    setEditingProgram(null);
    setProgramForm(emptyProgramForm);
    setFormError("");
  };

  const resetMaterialEditor = () => {
    setShowMaterialEditor(false);
    setEditingMaterial(null);
    setMaterialForm(emptyMaterialForm);
    setSelectedFile(null);
    setRemoveCurrentFile(false);
    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openNewProgram = () => {
    setEditingProgram(null);
    setProgramForm(emptyProgramForm);
    setFormError("");
    setShowProgramEditor(true);
  };

  const openEditProgram = (program: TrainingProgram) => {
    setEditingProgram(program);
    setProgramForm({
      title: program.title,
      slug: program.slug,
      description: program.description ?? "",
      learning_objectives: arrayToLines(program.learning_objectives),
      duration: program.duration ?? "",
      fee: program.fee ?? "",
      schedule: program.schedule ?? "",
      enrollment_url: program.enrollment_url ?? "",
      display_order: String(program.display_order ?? 0),
      enabled: program.enabled,
    });
    setFormError("");
    setShowProgramEditor(true);
  };

  const openNewMaterial = () => {
    setEditingMaterial(null);
    setMaterialForm(emptyMaterialForm);
    setSelectedFile(null);
    setRemoveCurrentFile(false);
    setFormError("");
    setShowMaterialEditor(true);
  };

  const openEditMaterial = (material: TrainingMaterial) => {
    setEditingMaterial(material);
    setMaterialForm({
      program_id: material.program_id ?? "",
      title: material.title,
      description: material.description ?? "",
      category: material.category,
      external_url: material.external_url ?? "",
      display_order: String(material.display_order ?? 0),
      enabled: material.enabled,
    });
    setSelectedFile(null);
    setRemoveCurrentFile(false);
    setFormError("");
    setShowMaterialEditor(true);
  };

  const uploadMaterialFile = async (file: File) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `${crypto.randomUUID()}-${safeName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return {
      url: data.publicUrl,
      path: filePath,
    };
  };

  // Save training program
  const saveProgramMutation = useMutation({
    mutationFn: async () => {
      const title = programForm.title.trim();
      const slug = slugify(programForm.slug || programForm.title);

      if (!title) throw new Error("Please enter a program title.");
      if (!slug) throw new Error("Please enter a valid program URL slug.");

      if (programForm.enrollment_url.trim()) {
        try {
          const url = new URL(programForm.enrollment_url.trim());
          if (!["http:", "https:"].includes(url.protocol)) throw new Error();
        } catch {
          throw new Error("Please enter a valid enrollment URL.");
        }
      }

      const payload = {
        title,
        slug,
        description: programForm.description.trim(),
        learning_objectives: linesToArray(
          programForm.learning_objectives
        ),
        duration: programForm.duration.trim(),
        fee: programForm.fee.trim(),
        schedule: programForm.schedule.trim(),
        enrollment_url: programForm.enrollment_url.trim() || null,
        display_order: Number(programForm.display_order) || 0,
        enabled: programForm.enabled,
        updated_at: new Date().toISOString(),
      };

      if (editingProgram) {
        const { error } = await supabase
          .from("training_programs")
          .update(payload)
          .eq("id", editingProgram.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("training_programs")
          .insert(payload);

        if (error) throw error;
      }
    },

    onSuccess: async () => {
      await invalidateTraining();
      setNotice(
        editingProgram
          ? "Training program updated successfully."
          : "Training program created successfully."
      );
      resetProgramEditor();
    },

    onError: (error: Error) => setFormError(error.message),
  });

  // Save training material
  const saveMaterialMutation = useMutation({
    mutationFn: async () => {
      const title = materialForm.title.trim();
      const externalUrl = materialForm.external_url.trim();

      if (!title) throw new Error("Please enter a material title.");

      if (
        !selectedFile &&
        !externalUrl &&
        !editingMaterial?.file_url
      ) {
        throw new Error("Upload a file or provide an external URL.");
      }

      if (externalUrl) {
        try {
          const url = new URL(externalUrl);
          if (!["http:", "https:"].includes(url.protocol)) throw new Error();
        } catch {
          throw new Error("Please enter a valid external URL.");
        }
      }

      let fileUrl = editingMaterial?.file_url ?? null;
      let fileName = editingMaterial?.file_name ?? null;

      if (selectedFile) {
        const uploaded = await uploadMaterialFile(selectedFile);
        fileUrl = uploaded.url;
        fileName = selectedFile.name;
      } else if (removeCurrentFile) {
        fileUrl = null;
        fileName = null;
      }

      const payload = {
        program_id: materialForm.program_id || null,
        title,
        description: materialForm.description.trim(),
        category: materialForm.category.trim() || "General",
        file_url: fileUrl,
        file_name: fileName,
        external_url: externalUrl || null,
        display_order: Number(materialForm.display_order) || 0,
        enabled: materialForm.enabled,
        updated_at: new Date().toISOString(),
      };

      if (editingMaterial) {
        const { error } = await supabase
          .from("training_materials")
          .update(payload)
          .eq("id", editingMaterial.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("training_materials")
          .insert(payload);

        if (error) throw error;
      }

      if (
        editingMaterial?.file_url &&
        (selectedFile || removeCurrentFile)
      ) {
        const oldPath = editingMaterial.file_url.split(`/${BUCKET}/`)[1];

        if (oldPath) {
          const { error } = await supabase.storage
            .from(BUCKET)
            .remove([oldPath]);

          if (error) {
            throw new Error(
              `Material saved, but the previous file could not be removed: ${error.message}`
            );
          }
        }
      }
    },

    onSuccess: async () => {
      await invalidateTraining();
      setNotice(
        editingMaterial
          ? "Training material updated successfully."
          : "Training material added successfully."
      );
      resetMaterialEditor();
    },

    onError: (error: Error) => setFormError(error.message),
  });

  // Publish / hide program
  const toggleProgramMutation = useMutation({
    mutationFn: async (program: TrainingProgram) => {
      const { error } = await supabase
        .from("training_programs")
        .update({
          enabled: !program.enabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", program.id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await invalidateTraining();
      setNotice("Program visibility updated.");
    },
    onError: (error: Error) => setNotice(error.message),
  });

  // Publish / hide material
  const toggleMaterialMutation = useMutation({
    mutationFn: async (material: TrainingMaterial) => {
      const { error } = await supabase
        .from("training_materials")
        .update({
          enabled: !material.enabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", material.id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await invalidateTraining();
      setNotice("Material visibility updated.");
    },
    onError: (error: Error) => setNotice(error.message),
  });

  // Delete program
  const deleteProgramMutation = useMutation({
    mutationFn: async (program: TrainingProgram) => {
      const { error } = await supabase
        .from("training_programs")
        .delete()
        .eq("id", program.id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await invalidateTraining();
      setDeleteProgram(null);
      setNotice("Training program deleted. Its materials are now unassigned.");
    },
    onError: (error: Error) => setNotice(error.message),
  });

  // Delete material and its uploaded file
  const deleteMaterialMutation = useMutation({
    mutationFn: async (material: TrainingMaterial) => {
      const { error } = await supabase
        .from("training_materials")
        .delete()
        .eq("id", material.id);

      if (error) throw error;

      if (material.file_url) {
        const filePath = material.file_url.split(`/${BUCKET}/`)[1];

        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from(BUCKET)
            .remove([filePath]);

          if (storageError) {
            throw new Error(
              `Material record deleted, but file removal failed: ${storageError.message}`
            );
          }
        }
      }
    },
    onSuccess: async () => {
      await invalidateTraining();
      setDeleteMaterial(null);
      setNotice("Training material deleted successfully.");
    },
    onError: (error: Error) => setNotice(error.message),
  });

  const handleFileChange = (file?: File) => {
    setFormError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setFormError(
        "Unsupported format. Upload PDF, DOC, DOCX, PPT, PPTX, XLS, or XLSX."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFormError("File size must be 10 MB or smaller.");
      return;
    }

    setSelectedFile(file);
    setRemoveCurrentFile(false);
  };

  const isLoading = programsQuery.isLoading || materialsQuery.isLoading;
  const hasError = programsQuery.isError || materialsQuery.isError;

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#B7792B]">
            <GraduationCap size={17} />
            <span>Website Content</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#243653] sm:text-3xl">
            Training & Learning
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage professional tax training programs, course information,
            learning materials, and enrollment resources.
          </p>
        </div>

        <button
          type="button"
          onClick={
            activeTab === "programs" ? openNewProgram : openNewMaterial
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2940]"
        >
          <Plus size={17} />
          {activeTab === "programs" ? "Add Program" : "Add Material"}
        </button>
      </div>

      {/* Notifications */}
      {notice && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={17} className="shrink-0 text-green-600" />
            <span>{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Total Programs",
            value: programs.length,
            icon: GraduationCap,
          },
          {
            label: "Published Programs",
            value: publishedPrograms,
            icon: Eye,
          },
          {
            label: "Learning Materials",
            value: materials.length,
            icon: BookOpen,
          },
          {
            label: "Published Materials",
            value: publishedMaterials,
            icon: FileText,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  {item.label}
                </p>
                <Icon size={18} className="text-[#B7792B]" />
              </div>
              <p className="mt-3 text-2xl font-bold text-[#243653]">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => {
            setActiveTab("programs");
            setSearch("");
            setStatusFilter("all");
          }}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
            activeTab === "programs"
              ? "border-[#B7792B] text-[#243653]"
              : "border-transparent text-slate-500 hover:text-[#243653]"
          }`}
        >
          <GraduationCap size={17} />
          Training Programs
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
            {programs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("materials");
            setSearch("");
            setStatusFilter("all");
          }}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
            activeTab === "materials"
              ? "border-[#B7792B] text-[#243653]"
              : "border-transparent text-slate-500 hover:text-[#243653]"
          }`}
        >
          <BookOpen size={17} />
          Training Materials
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
            {materials.length}
          </span>
        </button>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              activeTab === "programs"
                ? "Search programs..."
                : "Search learning materials..."
            }
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#B7792B] focus:ring-2 focus:ring-[#B7792B]/10"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#B7792B]"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      {/* Loading and errors */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          Loading training information...
        </div>
      ) : hasError ? (
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
          <AlertCircle className="mx-auto text-red-500" size={28} />
          <h2 className="mt-3 font-semibold text-[#243653]">
            Unable to load training data
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {programsQuery.error?.message || materialsQuery.error?.message}
          </p>
          <button
            type="button"
            onClick={() => {
              programsQuery.refetch();
              materialsQuery.refetch();
            }}
            className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-[#243653]"
          >
            Try again
          </button>
        </div>
      ) : activeTab === "programs" ? (
        /* Training programs list */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-[#243653]">
              Training Programs
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredPrograms.length} program
              {filteredPrograms.length === 1 ? "" : "s"} found
            </p>
          </div>

          {filteredPrograms.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <GraduationCap
                size={30}
                className="mx-auto text-slate-300"
              />
              <h3 className="mt-3 font-semibold text-[#243653]">
                No training programs found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Add a training program or adjust your search.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPrograms.map((program) => (
                <div
                  key={program.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#243653]/5 text-[#243653]">
                    <GraduationCap size={23} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[#243653]">
                        {program.title}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          program.enabled
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {program.enabled ? "Published" : "Hidden"}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      /{program.slug}
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {program.description || "No description provided."}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                      {program.duration && (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={13} />
                          {program.duration}
                        </span>
                      )}
                      {program.schedule && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={13} />
                          {program.schedule}
                        </span>
                      )}
                      {program.fee && <span>Fee: {program.fee}</span>}
                      <span>
                        {program.learning_objectives?.length ?? 0} objectives
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {program.enrollment_url && (
                      <a
                        href={program.enrollment_url}
                        target="_blank"
                        rel="noreferrer"
                        title="Open enrollment link"
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-[#B7792B]"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        toggleProgramMutation.mutate(program)
                      }
                      disabled={toggleProgramMutation.isPending}
                      title={program.enabled ? "Hide program" : "Publish program"}
                      className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-[#B7792B] disabled:opacity-50"
                    >
                      {program.enabled ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditProgram(program)}
                      title="Edit program"
                      className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-[#B7792B]"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteProgram(program)}
                      title="Delete program"
                      className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Training materials list */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-[#243653]">
              Training Materials
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredMaterials.length} material
              {filteredMaterials.length === 1 ? "" : "s"} found
            </p>
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <BookOpen size={30} className="mx-auto text-slate-300" />
              <h3 className="mt-3 font-semibold text-[#243653]">
                No training materials found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Upload a document or add an external learning link.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredMaterials.map((material) => {
                const program = programs.find(
                  (item) => item.id === material.program_id
                );

                return (
                  <div
                    key={material.id}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#243653]/5 text-[#243653]">
                      {material.file_url ? (
                        <FileText size={22} />
                      ) : (
                        <LinkIcon size={22} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[#243653]">
                          {material.title}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            material.enabled
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {material.enabled ? "Published" : "Hidden"}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {material.description || "No description provided."}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                        <span>{material.category}</span>
                        {program && <span>{program.title}</span>}
                        {material.file_name && (
                          <span className="max-w-[180px] truncate">
                            {material.file_name}
                          </span>
                        )}
                        {!material.program_id && (
                          <span>General material</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {material.file_url && (
                        <a
                          href={material.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <Download size={14} />
                          File
                        </a>
                      )}

                      {material.external_url && (
                        <a
                          href={material.external_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <ExternalLink size={14} />
                          Link
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          toggleMaterialMutation.mutate(material)
                        }
                        disabled={toggleMaterialMutation.isPending}
                        title={
                          material.enabled ? "Hide material" : "Publish material"
                        }
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-[#B7792B] disabled:opacity-50"
                      >
                        {material.enabled ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditMaterial(material)}
                        title="Edit material"
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-[#B7792B]"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteMaterial(material)}
                        title="Delete material"
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Program editor */}
      {showProgramEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-[#243653]">
                  {editingProgram ? "Edit Training Program" : "Add Training Program"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Provide the program details visitors need before enrolling.
                </p>
              </div>
              <button
                type="button"
                onClick={resetProgramEditor}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Close program editor"
              >
                <X size={19} />
              </button>
            </div>

            <div className="max-h-[72vh] space-y-5 overflow-y-auto p-5 sm:p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Program Title *
                </label>
                <input
                  value={programForm.title}
                  onChange={(event) => {
                    const title = event.target.value;
                    setProgramForm((previous) => ({
                      ...previous,
                      title,
                      slug: editingProgram ? previous.slug : slugify(title),
                    }));
                  }}
                  placeholder="e.g. Professional Income Tax Training"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  URL Slug *
                </label>
                <input
                  value={programForm.slug}
                  onChange={(event) =>
                    setProgramForm({
                      ...programForm,
                      slug: slugify(event.target.value),
                    })
                  }
                  placeholder="professional-income-tax-training"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Program Description
                </label>
                <textarea
                  rows={4}
                  value={programForm.description}
                  onChange={(event) =>
                    setProgramForm({
                      ...programForm,
                      description: event.target.value,
                    })
                  }
                  placeholder="Describe the program, its audience, and what participants can expect..."
                  className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Learning Objectives
                </label>
                <textarea
                  rows={4}
                  value={programForm.learning_objectives}
                  onChange={(event) =>
                    setProgramForm({
                      ...programForm,
                      learning_objectives: event.target.value,
                    })
                  }
                  placeholder={
                    "Understand income tax fundamentals\nLearn return preparation\nUnderstand tax compliance"
                  }
                  className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Enter one learning objective per line.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Duration
                  </label>
                  <input
                    value={programForm.duration}
                    onChange={(event) =>
                      setProgramForm({
                        ...programForm,
                        duration: event.target.value,
                      })
                    }
                    placeholder="e.g. 6 weeks"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Fee
                  </label>
                  <input
                    value={programForm.fee}
                    onChange={(event) =>
                      setProgramForm({
                        ...programForm,
                        fee: event.target.value,
                      })
                    }
                    placeholder="e.g. ৳5,000 or Free"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Schedule
                </label>
                <input
                  value={programForm.schedule}
                  onChange={(event) =>
                    setProgramForm({
                      ...programForm,
                      schedule: event.target.value,
                    })
                  }
                  placeholder="e.g. Friday and Saturday, 7:00 PM"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Enrollment URL
                </label>
                <input
                  type="url"
                  value={programForm.enrollment_url}
                  onChange={(event) =>
                    setProgramForm({
                      ...programForm,
                      enrollment_url: event.target.value,
                    })
                  }
                  placeholder="https://example.com/enroll"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Display Order
                </label>
                <input
                  type="number"
                  value={programForm.display_order}
                  onChange={(event) =>
                    setProgramForm({
                      ...programForm,
                      display_order: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B] sm:max-w-xs"
                />
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-medium text-[#243653]">
                    Publish Program
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Published programs can appear on the public website.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={programForm.enabled}
                  onChange={(event) =>
                    setProgramForm({
                      ...programForm,
                      enabled: event.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-[#243653]"
                />
              </label>

              {formError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={resetProgramEditor}
                disabled={saveProgramMutation.isPending}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormError("");
                  saveProgramMutation.mutate();
                }}
                disabled={saveProgramMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1b2940] disabled:opacity-60"
              >
                {saveProgramMutation.isPending && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {editingProgram ? "Save Changes" : "Create Program"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Material editor */}
      {showMaterialEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-[#243653]">
                  {editingMaterial ? "Edit Training Material" : "Add Training Material"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Upload a learning document or add an external resource.
                </p>
              </div>
              <button
                type="button"
                onClick={resetMaterialEditor}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Close material editor"
              >
                <X size={19} />
              </button>
            </div>

            <div className="max-h-[72vh] space-y-5 overflow-y-auto p-5 sm:p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Material Title *
                </label>
                <input
                  value={materialForm.title}
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      title: event.target.value,
                    })
                  }
                  placeholder="e.g. Income Tax Training Slides"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Related Training Program
                </label>
                <select
                  value={materialForm.program_id}
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      program_id: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                >
                  <option value="">General material (no specific program)</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={materialForm.description}
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      description: event.target.value,
                    })
                  }
                  placeholder="Explain what this learning material covers..."
                  className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Category
                  </label>
                  <input
                    value={materialForm.category}
                    onChange={(event) =>
                      setMaterialForm({
                        ...materialForm,
                        category: event.target.value,
                      })
                    }
                    placeholder="e.g. Presentation"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={materialForm.display_order}
                    onChange={(event) =>
                      setMaterialForm({
                        ...materialForm,
                        display_order: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                  />
                </div>
              </div>

              {/* Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Upload Learning Material
                </label>

                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    onChange={(event) =>
                      handleFileChange(event.target.files?.[0])
                    }
                    className="hidden"
                    id="training-material-file"
                  />

                  <label
                    htmlFor="training-material-file"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#B7792B] shadow-sm">
                      <FileUp size={21} />
                    </div>
                    <span className="text-sm font-medium text-[#243653]">
                      Choose a learning document
                    </span>
                    <span className="text-xs text-slate-400">
                      PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX · Maximum 10 MB
                    </span>
                  </label>

                  {selectedFile && (
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText size={17} className="shrink-0 text-[#B7792B]" />
                        <span className="truncate text-sm text-slate-700">
                          {selectedFile.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        aria-label="Remove selected file"
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {!selectedFile &&
                    editingMaterial?.file_name &&
                    !removeCurrentFile && (
                      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <span className="truncate text-sm text-slate-600">
                          Current file: {editingMaterial.file_name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRemoveCurrentFile(true)}
                          className="shrink-0 text-xs font-medium text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                  {removeCurrentFile && (
                    <p className="mt-3 text-xs text-amber-700">
                      The existing file will be removed when you save.
                    </p>
                  )}
                </div>
              </div>

              {/* External URL */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  External Learning URL
                </label>
                <div className="relative">
                  <LinkIcon
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="url"
                    value={materialForm.external_url}
                    onChange={(event) =>
                      setMaterialForm({
                        ...materialForm,
                        external_url: event.target.value,
                      })
                    }
                    placeholder="https://example.com/learning-resource"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#B7792B]"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Optional. You can upload a file, add a link, or provide both.
                </p>
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-medium text-[#243653]">
                    Publish Material
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Published materials can appear on the public website.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={materialForm.enabled}
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      enabled: event.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-[#243653]"
                />
              </label>

              {formError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={resetMaterialEditor}
                disabled={saveMaterialMutation.isPending}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormError("");
                  saveMaterialMutation.mutate();
                }}
                disabled={saveMaterialMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1b2940] disabled:opacity-60"
              >
                {saveMaterialMutation.isPending && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {editingMaterial ? "Save Changes" : "Add Material"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete program confirmation */}
      {deleteProgram && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#243653]">
              Delete training program?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Delete <strong>{deleteProgram.title}</strong>? Its associated
              materials will remain in the library but become unassigned.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteProgram(null)}
                disabled={deleteProgramMutation.isPending}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteProgramMutation.mutate(deleteProgram)}
                disabled={deleteProgramMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleteProgramMutation.isPending && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Delete Program
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete material confirmation */}
      {deleteMaterial && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#243653]">
              Delete training material?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Delete <strong>{deleteMaterial.title}</strong>? This action
              cannot be undone.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteMaterial(null)}
                disabled={deleteMaterialMutation.isPending}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMaterialMutation.mutate(deleteMaterial)}
                disabled={deleteMaterialMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleteMaterialMutation.isPending && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Delete Material
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
