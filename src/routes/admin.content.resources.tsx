
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  FileUp,
  Link as LinkIcon,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  X,
  BookOpen,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/content/resources")({
  component: ResourcesPage,
});

const BUCKET = "tax-resources";

type Resource = {
  id: string;
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

type ResourceForm = {
  title: string;
  description: string;
  category: string;
  external_url: string;
  display_order: string;
  enabled: boolean;
};

const emptyForm: ResourceForm = {
  title: "",
  description: "",
  category: "General",
  external_url: "",
  display_order: "0",
  enabled: true,
};

const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function ResourcesPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showEditor, setShowEditor] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [form, setForm] = useState<ResourceForm>(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeCurrentFile, setRemoveCurrentFile] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);

  const resourcesQuery = useQuery({
    queryKey: ["admin-resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Resource[];
    },
  });

  const resources = resourcesQuery.data ?? [];

  const categories = [
    "All",
    ...Array.from(new Set(resources.map((item) => item.category).filter(Boolean))),
  ];

  const filteredResources = resources.filter((resource) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      resource.title.toLowerCase().includes(searchValue) ||
      resource.description.toLowerCase().includes(searchValue) ||
      resource.category.toLowerCase().includes(searchValue) ||
      (resource.file_name ?? "").toLowerCase().includes(searchValue);

    const matchesCategory =
      categoryFilter === "All" || resource.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const publishedCount = resources.filter((item) => item.enabled).length;
  const hiddenCount = resources.length - publishedCount;
  const fileCount = resources.filter((item) => item.file_url).length;
  const linkCount = resources.filter((item) => item.external_url).length;

  const resetEditor = () => {
    setShowEditor(false);
    setEditingResource(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setRemoveCurrentFile(false);
    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openCreateEditor = () => {
    setEditingResource(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setRemoveCurrentFile(false);
    setFormError("");
    setShowEditor(true);
  };

  const openEditEditor = (resource: Resource) => {
    setEditingResource(resource);
    setForm({
      title: resource.title,
      description: resource.description,
      category: resource.category,
      external_url: resource.external_url ?? "",
      display_order: String(resource.display_order),
      enabled: resource.enabled,
    });
    setSelectedFile(null);
    setRemoveCurrentFile(false);
    setFormError("");
    setShowEditor(true);
  };

  const uploadFile = async (file: File) => {
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

  const saveMutation = useMutation({
    mutationFn: async () => {
      const title = form.title.trim();
      const externalUrl = form.external_url.trim();

      if (!title) {
        throw new Error("Please enter a resource title.");
      }

      if (!form.category.trim()) {
        throw new Error("Please enter a category.");
      }

      if (!selectedFile && !externalUrl && !editingResource?.file_url) {
        throw new Error("Upload a document or provide an external URL.");
      }

      if (externalUrl) {
        try {
          const parsedUrl = new URL(externalUrl);
          if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            throw new Error();
          }
        } catch {
          throw new Error("Please enter a valid HTTP or HTTPS URL.");
        }
      }

      let fileUrl = editingResource?.file_url ?? null;
      let fileName = editingResource?.file_name ?? null;

      if (selectedFile) {
        const uploaded = await uploadFile(selectedFile);
        fileUrl = uploaded.url;
        fileName = selectedFile.name;
      } else if (removeCurrentFile) {
        fileUrl = null;
        fileName = null;
      }

      const payload = {
        title,
        description: form.description.trim(),
        category: form.category.trim(),
        file_url: fileUrl,
        file_name: fileName,
        external_url: externalUrl || null,
        display_order: Number(form.display_order) || 0,
        enabled: form.enabled,
        updated_at: new Date().toISOString(),
      };

      if (editingResource) {
        const { error } = await supabase
          .from("resources")
          .update(payload)
          .eq("id", editingResource.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("resources")
          .insert(payload);

        if (error) throw error;
      }

      if (
        editingResource?.file_url &&
        (selectedFile || removeCurrentFile)
      ) {
        const oldPath = editingResource.file_url.split(`/${BUCKET}/`)[1];

        if (oldPath) {
          await supabase.storage.from(BUCKET).remove([oldPath]);
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-resources"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["public-resources"],
      });

      setNotice(
        editingResource
          ? "Resource updated successfully."
          : "Resource added successfully."
      );
      resetEditor();
    },
    onError: (error: Error) => {
      setFormError(error.message || "Unable to save the resource.");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (resource: Resource) => {
      const { error } = await supabase
        .from("resources")
        .update({
          enabled: !resource.enabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", resource.id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-resources"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["public-resources"],
      });
      setNotice("Resource visibility updated.");
    },
    onError: (error: Error) => setNotice(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (resource: Resource) => {
      const { error } = await supabase
        .from("resources")
        .delete()
        .eq("id", resource.id);

      if (error) throw error;

      if (resource.file_url) {
        const filePath = resource.file_url.split(`/${BUCKET}/`)[1];

        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from(BUCKET)
            .remove([filePath]);

          if (storageError) {
            throw new Error(
              `Resource record deleted, but its file could not be removed: ${storageError.message}`
            );
          }
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-resources"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["public-resources"],
      });
      setDeleteTarget(null);
      setNotice("Resource deleted successfully.");
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
        "Unsupported file format. Upload PDF, DOC, DOCX, XLS, XLSX, PPT, or PPTX."
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

  const handleSave = () => {
    setFormError("");
    setNotice("");
    saveMutation.mutate();
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#B7792B]">
            <BookOpen size={16} />
            <span>Website Content</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#243653] sm:text-3xl">
            Tax Resources Library
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage tax guides, downloadable documents, helpful links, and
            educational resources for your website visitors.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateEditor}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2940]"
        >
          <Plus size={17} />
          Add Resource
        </button>
      </div>

      {/* Notice */}
      {notice && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
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
            label: "Total Resources",
            value: resources.length,
            icon: BookOpen,
          },
          {
            label: "Published",
            value: publishedCount,
            icon: Eye,
          },
          {
            label: "Hidden",
            value: hiddenCount,
            icon: EyeOff,
          },
          {
            label: "Uploaded Files",
            value: fileCount,
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

      {/* Search and filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search resources by title, description, or category..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#B7792B] focus:ring-2 focus:ring-[#B7792B]/10"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#B7792B]"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "All" ? "All Categories" : category}
            </option>
          ))}
        </select>
      </div>

      {/* Resource list */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-[#243653]">
              Resource Collection
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredResources.length} resource
              {filteredResources.length === 1 ? "" : "s"} found
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {linkCount} external links
          </span>
        </div>

        {resourcesQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            Loading resources...
          </div>
        ) : resourcesQuery.isError ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <AlertCircle size={28} className="text-red-500" />
            <p className="mt-3 font-medium text-[#243653]">
              Could not load resources
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {resourcesQuery.error.message}
            </p>
            <button
              type="button"
              onClick={() => resourcesQuery.refetch()}
              className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-[#243653] hover:bg-slate-50"
            >
              Try again
            </button>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <BookOpen size={25} />
            </div>
            <h3 className="mt-4 font-semibold text-[#243653]">
              No resources found
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {resources.length === 0
                ? "Start building your resource library by adding a document or useful link."
                : "Try another search term or category filter."}
            </p>
            {resources.length === 0 && (
              <button
                type="button"
                onClick={openCreateEditor}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#243653] px-4 py-2 text-sm font-medium text-white hover:bg-[#1b2940]"
              >
                <Plus size={16} />
                Add your first resource
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="flex flex-col gap-4 p-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:p-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#243653]/5 text-[#243653]">
                  {resource.file_url ? (
                    <FileText size={22} />
                  ) : (
                    <LinkIcon size={22} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[#243653]">
                      {resource.title}
                    </h3>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        resource.enabled
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {resource.enabled ? "Published" : "Hidden"}
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                    {resource.description || "No description provided."}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    <span>{resource.category}</span>
                    <span>Order: {resource.display_order}</span>
                    {resource.file_name && (
                      <span className="max-w-[180px] truncate">
                        {resource.file_name}
                      </span>
                    )}
                    {resource.external_url && <span>External link</span>}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {resource.file_url && (
                    <a
                      href={resource.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      <Download size={14} />
                      File
                    </a>
                  )}

                  {resource.external_url && (
                    <a
                      href={resource.external_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      <ExternalLink size={14} />
                      Link
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleMutation.mutate(resource)}
                    disabled={toggleMutation.isPending}
                    title={resource.enabled ? "Hide resource" : "Publish resource"}
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-[#B7792B]/40 hover:text-[#B7792B] disabled:opacity-50"
                  >
                    {resource.enabled ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditEditor(resource)}
                    title="Edit resource"
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-[#B7792B]/40 hover:text-[#B7792B]"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(resource)}
                    title="Delete resource"
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-[#243653]">
                  {editingResource ? "Edit Resource" : "Add New Resource"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Add a document or a useful external resource.
                </p>
              </div>

              <button
                type="button"
                onClick={resetEditor}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close editor"
              >
                <X size={19} />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-5 overflow-y-auto p-5 sm:p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Resource Title *
                </label>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="e.g. Bangladesh Income Tax Guide 2026"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B] focus:ring-2 focus:ring-[#B7792B]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Briefly explain what visitors will find in this resource..."
                  className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B] focus:ring-2 focus:ring-[#B7792B]/10"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Category *
                  </label>
                  <input
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    placeholder="e.g. Income Tax"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(event) =>
                      setForm({ ...form, display_order: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Lower numbers appear first.
                  </p>
                </div>
              </div>

              {/* File upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Upload Document
                </label>

                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={(event) =>
                      handleFileChange(event.target.files?.[0])
                    }
                    className="hidden"
                    id="resource-file"
                  />

                  <label
                    htmlFor="resource-file"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#B7792B] shadow-sm">
                      <FileUp size={21} />
                    </div>
                    <span className="text-sm font-medium text-[#243653]">
                      Choose a document to upload
                    </span>
                    <span className="text-xs text-slate-400">
                      PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX · Maximum 10 MB
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
                        className="text-slate-400 hover:text-red-600"
                        aria-label="Remove selected file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {!selectedFile && editingResource?.file_name && !removeCurrentFile && (
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <span className="truncate text-sm text-slate-600">
                        Current file: {editingResource.file_name}
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
                      The existing uploaded file will be removed when you save.
                    </p>
                  )}
                </div>
              </div>

              {/* External link */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  External Resource URL
                </label>
                <div className="relative">
                  <LinkIcon
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="url"
                    value={form.external_url}
                    onChange={(event) =>
                      setForm({ ...form, external_url: event.target.value })
                    }
                    placeholder="https://example.com/resource"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#B7792B]"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Optional. You can add a document, a URL, or both.
                </p>
              </div>

              {/* Publish toggle */}
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-medium text-[#243653]">
                    Publish resource
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Published resources can appear on the public website.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(event) =>
                    setForm({ ...form, enabled: event.target.checked })
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
                onClick={resetEditor}
                disabled={saveMutation.isPending}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1b2940] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveMutation.isPending && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {editingResource ? "Save Changes" : "Add Resource"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[#243653]">
              Delete this resource?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <strong className="text-slate-700">{deleteTarget.title}</strong>?
              This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMutation.isPending}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteTarget)}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleteMutation.isPending && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Delete Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
