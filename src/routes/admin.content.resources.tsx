import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FileUp,
  FolderOpen,
  Link as LinkIcon,
  Loader2,
  Pencil,
  Plus,
  Search,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/content/resources")({
  component: ResourcesPage,
});

const BUCKET = "tax-resources";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const DEFAULT_CATEGORIES = [
  "Income Tax Guides",
  "Corporate Tax Guides",
  "VAT Guides",
  "TIN and BIN Guides",
  "Business Registration Guides",
  "RJSC and Company Law",
  "Foreign Investment",
  "Accounting and Bookkeeping",
  "Regulatory Compliance",
  "Tax Updates and News",
];

type Category = {
  id: string;
  name: string;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

type Resource = {
  id: string;
  title: string;
  description: string;
  category: string;
  category_id: string | null;
  file_url: string | null;
  file_name: string | null;
  external_url: string | null;
  display_order: number;
  enabled: boolean;
  last_verified_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type PageSettings = {
  id: number;
  source_title: string;
  source_description: string;
  source_link_label: string;
  source_url: string;
  updated_at: string;
};

type ResourceForm = {
  title: string;
  description: string;
  category_id: string;
  external_url: string;
  display_order: string;
  last_verified_at: string;
  enabled: boolean;
};

type CategoryForm = {
  name: string;
  display_order: string;
  enabled: boolean;
};

type SettingsForm = {
  source_title: string;
  source_description: string;
  source_link_label: string;
  source_url: string;
};

const emptyResourceForm: ResourceForm = {
  title: "",
  description: "",
  category_id: "",
  external_url: "",
  display_order: "0",
  last_verified_at: "",
  enabled: true,
};

const emptyCategoryForm: CategoryForm = {
  name: "",
  display_order: "0",
  enabled: true,
};

const defaultSettings: SettingsForm = {
  source_title: "Official source",
  source_description:
    "For current rates, deadlines, and official notices, always refer to the National Board of Revenue.",
  source_link_label: "National Board of Revenue (nbr.gov.bd)",
  source_url: "https://nbr.gov.bd/",
};

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getStoragePath(publicUrl: string | null) {
  if (!publicUrl) return null;
  const marker = `/${BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  return index === -1 ? null : publicUrl.slice(index + marker.length).split("?")[0];
}

function ResourcesPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"categories" | "articles" | "sources">("articles");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showResourceEditor, setShowResourceEditor] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [resourceForm, setResourceForm] = useState<ResourceForm>(emptyResourceForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeCurrentFile, setRemoveCurrentFile] = useState(false);
  const [resourceError, setResourceError] = useState("");

  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm);
  const [categoryError, setCategoryError] = useState("");

  const [settingsForm, setSettingsForm] = useState<SettingsForm>(defaultSettings);
  const [settingsError, setSettingsError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteResourceTarget, setDeleteResourceTarget] = useState<Resource | null>(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<Category | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["admin-resource-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resource_categories")
        .select("*")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });

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

  const settingsQuery = useQuery({
    queryKey: ["resource-page-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resource_page_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return data as PageSettings | null;
    },
  });

  const categories = categoriesQuery.data ?? [];
  const resources = resourcesQuery.data ?? [];
  const settings = settingsQuery.data;

  // Populate the settings editor once the database query has returned.
  useEffect(() => {
    if (settings) {
      setSettingsForm({
        source_title: settings.source_title,
        source_description: settings.source_description,
        source_link_label: settings.source_link_label,
        source_url: settings.source_url,
      });
    }
  }, [settings]);

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const filteredResources = useMemo(() => {
    const term = search.trim().toLowerCase();
    return resources.filter((resource) => {
      const categoryName =
        categoryById.get(resource.category_id ?? "")?.name ?? resource.category ?? "";
      const matchesSearch =
        !term ||
        resource.title.toLowerCase().includes(term) ||
        resource.description.toLowerCase().includes(term) ||
        categoryName.toLowerCase().includes(term) ||
        (resource.file_name ?? "").toLowerCase().includes(term) ||
        (resource.external_url ?? "").toLowerCase().includes(term);
      const matchesCategory =
        categoryFilter === "all" || resource.category_id === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [resources, search, categoryFilter, categoryById]);

  const publishedCount = resources.filter((item) => item.enabled).length;
  const hiddenCount = resources.length - publishedCount;
  const fileCount = resources.filter((item) => item.file_url).length;
  const linkCount = resources.filter((item) => item.external_url).length;

  const refreshResources = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] }),
      queryClient.invalidateQueries({ queryKey: ["public-resources"] }),
    ]);
  };

  const refreshCategories = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-resource-categories"] }),
      queryClient.invalidateQueries({ queryKey: ["public-resource-categories"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] }),
      queryClient.invalidateQueries({ queryKey: ["public-resources"] }),
    ]);
  };

  const resetResourceEditor = () => {
    setShowResourceEditor(false);
    setEditingResource(null);
    setResourceForm({ ...emptyResourceForm, category_id: categories[0]?.id ?? "" });
    setSelectedFile(null);
    setRemoveCurrentFile(false);
    setResourceError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreateResource = () => {
    setEditingResource(null);
    setResourceForm({ ...emptyResourceForm, category_id: categories.find((c) => c.enabled)?.id ?? "" });
    setSelectedFile(null);
    setRemoveCurrentFile(false);
    setResourceError("");
    setShowResourceEditor(true);
  };

  const openEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setResourceForm({
      title: resource.title,
      description: resource.description ?? "",
      category_id: resource.category_id ?? categories.find((c) => c.name === resource.category)?.id ?? "",
      external_url: resource.external_url ?? "",
      display_order: String(resource.display_order ?? 0),
      last_verified_at: resource.last_verified_at ?? "",
      enabled: resource.enabled,
    });
    setSelectedFile(null);
    setRemoveCurrentFile(false);
    setResourceError("");
    setShowResourceEditor(true);
  };

  const uploadFile = async (file: File) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, path };
  };

  const saveResourceMutation = useMutation({
    mutationFn: async () => {
      const title = resourceForm.title.trim();
      const externalUrl = resourceForm.external_url.trim();
      if (!title) throw new Error("Please enter a resource title.");
      if (!resourceForm.category_id) throw new Error("Please select a category.");
      if (!externalUrl && !selectedFile && !editingResource?.file_url) {
        throw new Error("Provide an external URL or upload a document.");
      }
      if (externalUrl && !isValidHttpUrl(externalUrl)) {
        throw new Error("Enter a valid URL beginning with http:// or https://.");
      }
      if (selectedFile && (!ALLOWED_TYPES.includes(selectedFile.type) || selectedFile.size > MAX_FILE_SIZE)) {
        throw new Error("Upload PDF, DOC, DOCX, XLS, XLSX, PPT or PPTX files up to 10 MB.");
      }

      const selectedCategory = categories.find((item) => item.id === resourceForm.category_id);
      if (!selectedCategory) throw new Error("The selected category no longer exists.");

      let fileUrl = editingResource?.file_url ?? null;
      let fileName = editingResource?.file_name ?? null;
      let newlyUploadedPath: string | null = null;

      if (selectedFile) {
        const uploaded = await uploadFile(selectedFile);
        fileUrl = uploaded.url;
        fileName = selectedFile.name;
        newlyUploadedPath = uploaded.path;
      } else if (removeCurrentFile) {
        fileUrl = null;
        fileName = null;
      }

      const payload = {
        title,
        description: resourceForm.description.trim(),
        category: selectedCategory.name, // retained for compatibility with older public-page code
        category_id: selectedCategory.id,
        file_url: fileUrl,
        file_name: fileName,
        external_url: externalUrl || null,
        display_order: Number(resourceForm.display_order) || 0,
        last_verified_at: resourceForm.last_verified_at || null,
        enabled: resourceForm.enabled,
        published_at: resourceForm.enabled
          ? editingResource?.published_at ?? new Date().toISOString()
          : editingResource?.published_at ?? null,
        updated_at: new Date().toISOString(),
      };

      const result = editingResource
        ? await supabase.from("resources").update(payload).eq("id", editingResource.id)
        : await supabase.from("resources").insert(payload);

      if (result.error) {
        if (newlyUploadedPath) await supabase.storage.from(BUCKET).remove([newlyUploadedPath]);
        throw result.error;
      }

      if (editingResource?.file_url && (selectedFile || removeCurrentFile)) {
        const oldPath = getStoragePath(editingResource.file_url);
        if (oldPath) {
          const { error } = await supabase.storage.from(BUCKET).remove([oldPath]);
          if (error) throw new Error(`Resource saved, but the old file could not be removed: ${error.message}`);
        }
      }
    },
    onSuccess: async () => {
      await refreshResources();
      setNotice(editingResource ? "Resource updated successfully." : "Resource added successfully.");
      resetResourceEditor();
    },
    onError: (error: Error) => setResourceError(error.message || "Unable to save resource."),
  });

  const toggleResourceMutation = useMutation({
    mutationFn: async (resource: Resource) => {
      const { error } = await supabase
        .from("resources")
        .update({
          enabled: !resource.enabled,
          published_at: !resource.enabled
            ? resource.published_at ?? new Date().toISOString()
            : resource.published_at,
          updated_at: new Date().toISOString(),
        })
        .eq("id", resource.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refreshResources();
      setNotice("Resource visibility updated.");
    },
    onError: (error: Error) => setNotice(error.message),
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (resource: Resource) => {
      const { error } = await supabase.from("resources").delete().eq("id", resource.id);
      if (error) throw error;
      const path = getStoragePath(resource.file_url);
      if (path) {
        const { error: storageError } = await supabase.storage.from(BUCKET).remove([path]);
        if (storageError) throw new Error(`Resource deleted, but its uploaded file could not be removed: ${storageError.message}`);
      }
    },
    onSuccess: async () => {
      await refreshResources();
      setDeleteResourceTarget(null);
      setNotice("Resource deleted successfully.");
    },
    onError: (error: Error) => setNotice(error.message),
  });

  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ ...emptyCategoryForm, display_order: String(categories.length + 1) });
    setCategoryError("");
    setShowCategoryEditor(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      display_order: String(category.display_order),
      enabled: category.enabled,
    });
    setCategoryError("");
    setShowCategoryEditor(true);
  };

  const saveCategoryMutation = useMutation({
    mutationFn: async () => {
      const name = categoryForm.name.trim();
      if (!name) throw new Error("Enter a category name.");
      const duplicate = categories.some(
        (category) => category.name.toLowerCase() === name.toLowerCase() && category.id !== editingCategory?.id,
      );
      if (duplicate) throw new Error("A category with this name already exists.");
      const payload = {
        name,
        display_order: Number(categoryForm.display_order) || 0,
        enabled: categoryForm.enabled,
        updated_at: new Date().toISOString(),
      };
      const result = editingCategory
        ? await supabase.from("resource_categories").update(payload).eq("id", editingCategory.id)
        : await supabase.from("resource_categories").insert(payload);
      if (result.error) throw result.error;
      // Keep the legacy text category synchronized when a category is renamed.
      if (editingCategory && editingCategory.name !== name) {
        const { error } = await supabase
          .from("resources")
          .update({ category: name, updated_at: new Date().toISOString() })
          .eq("category_id", editingCategory.id);
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      await refreshCategories();
      setShowCategoryEditor(false);
      setEditingCategory(null);
      setNotice(editingCategory ? "Category updated successfully." : "Category added successfully.");
    },
    onError: (error: Error) => setCategoryError(error.message),
  });

  const toggleCategoryMutation = useMutation({
    mutationFn: async (category: Category) => {
      const { error } = await supabase
        .from("resource_categories")
        .update({ enabled: !category.enabled, updated_at: new Date().toISOString() })
        .eq("id", category.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refreshCategories();
      setNotice("Category visibility updated.");
    },
    onError: (error: Error) => setNotice(error.message),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (category: Category) => {
      const { count, error: countError } = await supabase
        .from("resources")
        .select("id", { count: "exact", head: true })
        .eq("category_id", category.id);
      if (countError) throw countError;
      if ((count ?? 0) > 0) {
        throw new Error(`This category contains ${count} resource(s). Move or delete them before deleting the category.`);
      }
      const { error } = await supabase.from("resource_categories").delete().eq("id", category.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refreshCategories();
      setDeleteCategoryTarget(null);
      setNotice("Category deleted successfully.");
    },
    onError: (error: Error) => setNotice(error.message),
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...settingsForm,
        source_title: settingsForm.source_title.trim(),
        source_description: settingsForm.source_description.trim(),
        source_link_label: settingsForm.source_link_label.trim(),
        source_url: settingsForm.source_url.trim(),
        updated_at: new Date().toISOString(),
      };
      if (!payload.source_title || !payload.source_description || !payload.source_link_label || !payload.source_url) {
        throw new Error("Complete all Official Source fields before saving.");
      }
      if (!isValidHttpUrl(payload.source_url)) {
        throw new Error("Enter a valid source URL beginning with http:// or https://.");
      }
      const { error } = await supabase.from("resource_page_settings").upsert({ id: 1, ...payload });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["resource-page-settings"] });
      await queryClient.invalidateQueries({ queryKey: ["public-resource-page-settings"] });
      setSettingsError("");
      setNotice("Official Source card updated successfully.");
    },
    onError: (error: Error) => setSettingsError(error.message),
  });

  const handleFileChange = (file?: File) => {
    setResourceError("");
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setResourceError("Unsupported format. Upload PDF, DOC, DOCX, XLS, XLSX, PPT or PPTX.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setResourceError("File size must be 10 MB or smaller.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setSelectedFile(file);
    setRemoveCurrentFile(false);
  };

  const loading = categoriesQuery.isLoading || resourcesQuery.isLoading || settingsQuery.isLoading;
  const queryError = categoriesQuery.error || resourcesQuery.error || settingsQuery.error;

  return (
    <div className="space-y-7">
      {/* Page heading */}
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
            Manage resource categories, external tax guides, downloadable documents, and the Official Source card shown on your website.
          </p>
        </div>
        {activeTab === "articles" && (
          <button
            type="button"
            onClick={openCreateResource}
            disabled={categories.filter((item) => item.enabled).length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2940] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={17} /> Add Resource
          </button>
        )}
        {activeTab === "categories" && (
          <button
            type="button"
            onClick={openCreateCategory}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2940]"
          >
            <Plus size={17} /> Add Category
          </button>
        )}
      </div>

      {notice && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={17} className="shrink-0 text-green-600" />
            <span>{notice}</span>
          </div>
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss notification">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Categories", value: categories.length, icon: FolderOpen },
          { label: "Published", value: publishedCount, icon: Eye },
          { label: "Hidden", value: hiddenCount, icon: EyeOff },
          { label: "External Links", value: linkCount, icon: ExternalLink },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-500 sm:text-sm">{item.label}</p>
                <Icon size={18} className="text-[#B7792B]" />
              </div>
              <p className="mt-3 text-2xl font-bold text-[#243653]">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* CMS tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1.5">
        {[
          { id: "categories", label: "Categories", icon: FolderOpen },
          { id: "articles", label: "Resources", icon: FileText },
          { id: "sources", label: "Official Sources", icon: Settings2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                active ? "bg-[#243653] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-[#243653]"
              }`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {queryError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Could not load Resources CMS data</p>
            <p className="mt-1 break-words">{(queryError as Error).message}</p>
            <button
              type="button"
              onClick={() => {
                categoriesQuery.refetch();
                resourcesQuery.refetch();
                settingsQuery.refetch();
              }}
              className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
          <Loader2 size={18} className="animate-spin" /> Loading Resources CMS...
        </div>
      ) : (
        <>
          {/* Categories tab */}
          {activeTab === "categories" && (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-semibold text-[#243653]">Resource Categories</h2>
                <p className="mt-1 text-xs text-slate-500">These labels appear in the Categories section of the public Resources page.</p>
              </div>
              {categories.length === 0 ? (
                <EmptyState icon={<FolderOpen size={24} />} title="No categories yet" description="Add the categories visitors will use to browse resources." action="Add Category" onAction={openCreateCategory} />
              ) : (
                <div className="divide-y divide-slate-100">
                  {categories.map((category, index) => (
                    <div key={category.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#243653]/5 text-[#243653]">
                        <FolderOpen size={19} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-[#243653]">{category.name}</h3>
                          <StatusPill enabled={category.enabled} />
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Display order: {category.display_order}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={async () => {
                            const previous = categories[index - 1];
                            const { error } = await supabase.from("resource_categories").update({ display_order: previous.display_order, updated_at: new Date().toISOString() }).eq("id", category.id);
                            if (!error) await supabase.from("resource_categories").update({ display_order: category.display_order, updated_at: new Date().toISOString() }).eq("id", previous.id);
                            if (error) setNotice(error.message); else await refreshCategories();
                          }}
                          title="Move up"
                          className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                        ><ArrowUp size={15} /></button>
                        <button
                          type="button"
                          disabled={index === categories.length - 1}
                          onClick={async () => {
                            const next = categories[index + 1];
                            const { error } = await supabase.from("resource_categories").update({ display_order: next.display_order, updated_at: new Date().toISOString() }).eq("id", category.id);
                            if (!error) await supabase.from("resource_categories").update({ display_order: category.display_order, updated_at: new Date().toISOString() }).eq("id", next.id);
                            if (error) setNotice(error.message); else await refreshCategories();
                          }}
                          title="Move down"
                          className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                        ><ArrowDown size={15} /></button>
                        <button type="button" onClick={() => toggleCategoryMutation.mutate(category)} disabled={toggleCategoryMutation.isPending} title={category.enabled ? "Disable category" : "Enable category"} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-[#B7792B]/40 hover:text-[#B7792B] disabled:opacity-50">
                          {category.enabled ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button type="button" onClick={() => openEditCategory(category)} title="Edit category" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-[#B7792B]/40 hover:text-[#B7792B]">
                          <Pencil size={16} />
                        </button>
                        <button type="button" onClick={() => setDeleteCategoryTarget(category)} title="Delete category" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Resources tab */}
          {activeTab === "articles" && (
            <section className="space-y-4">
              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title, description, category or URL..." className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#B7792B] focus:ring-2 focus:ring-[#B7792B]/10" />
                </div>
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#B7792B]">
                  <option value="all">All Categories</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-[#243653]">Resource Collection</h2>
                    <p className="mt-1 text-xs text-slate-500">{filteredResources.length} resource{filteredResources.length === 1 ? "" : "s"} found · {fileCount} uploaded documents</p>
                  </div>
                  <span className="text-xs text-slate-400">External links and downloadable files</span>
                </div>
                {filteredResources.length === 0 ? (
                  <EmptyState icon={<BookOpen size={24} />} title="No resources found" description={resources.length === 0 ? "Start building your resource library by adding an external guide or downloadable document." : "Try another search term or category filter."} action={resources.length === 0 ? "Add Resource" : undefined} onAction={resources.length === 0 ? openCreateResource : undefined} />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredResources.map((resource) => {
                      const categoryName = categoryById.get(resource.category_id ?? "")?.name ?? resource.category ?? "Uncategorized";
                      return (
                        <div key={resource.id} className="flex flex-col gap-4 p-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:p-5">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#243653]/5 text-[#243653]">
                            {resource.file_url ? <FileText size={22} /> : <LinkIcon size={22} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-[#243653]">{resource.title}</h3>
                              <StatusPill enabled={resource.enabled} />
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">{resource.description || "No description provided."}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                              <span>{categoryName}</span>
                              <span>Order: {resource.display_order}</span>
                              {resource.file_name && <span className="max-w-[180px] truncate">{resource.file_name}</span>}
                              {resource.last_verified_at && <span>Verified: {resource.last_verified_at}</span>}
                              {resource.external_url && <span>External link</span>}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            {resource.file_url && <a href={resource.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"><Download size={14} /> File</a>}
                            {resource.external_url && <a href={resource.external_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"><ExternalLink size={14} /> Link</a>}
                            <button type="button" onClick={() => toggleResourceMutation.mutate(resource)} disabled={toggleResourceMutation.isPending} title={resource.enabled ? "Hide resource" : "Publish resource"} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-[#B7792B]/40 hover:text-[#B7792B] disabled:opacity-50">{resource.enabled ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                            <button type="button" onClick={() => openEditResource(resource)} title="Edit resource" className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-[#B7792B]/40 hover:text-[#B7792B]"><Pencil size={16} /></button>
                            <button type="button" onClick={() => setDeleteResourceTarget(resource)} title="Delete resource" className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Official Source tab */}
          {activeTab === "sources" && (
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5">
                  <h2 className="font-semibold text-[#243653]">Official Source Card</h2>
                  <p className="mt-1 text-sm text-slate-500">Edit the information and destination link shown in the public Resources page.</p>
                </div>
                <div className="space-y-4">
                  <FormField label="Card title">
                    <input value={settingsForm.source_title} onChange={(event) => setSettingsForm({ ...settingsForm, source_title: event.target.value })} className={inputClass} placeholder="Official source" />
                  </FormField>
                  <FormField label="Description">
                    <textarea rows={4} value={settingsForm.source_description} onChange={(event) => setSettingsForm({ ...settingsForm, source_description: event.target.value })} className={`${inputClass} resize-y`} placeholder="Explain why visitors should consult this source..." />
                  </FormField>
                  <FormField label="Link label">
                    <input value={settingsForm.source_link_label} onChange={(event) => setSettingsForm({ ...settingsForm, source_link_label: event.target.value })} className={inputClass} placeholder="National Board of Revenue (nbr.gov.bd)" />
                  </FormField>
                  <FormField label="Source URL">
                    <div className="relative">
                      <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="url" value={settingsForm.source_url} onChange={(event) => setSettingsForm({ ...settingsForm, source_url: event.target.value })} className={`${inputClass} pl-9`} placeholder="https://nbr.gov.bd/" />
                    </div>
                  </FormField>
                  {settingsError && <InlineError>{settingsError}</InlineError>}
                  <div className="flex justify-end border-t border-slate-100 pt-4">
                    <button type="button" onClick={() => saveSettingsMutation.mutate()} disabled={saveSettingsMutation.isPending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1b2940] disabled:cursor-not-allowed disabled:opacity-60">
                      {saveSettingsMutation.isPending && <Loader2 size={16} className="animate-spin" />} Save Source Card
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#243653]">Public card preview</p>
                <div className="rounded-md bg-[#F4F6F8] p-6">
                  <h3 className="text-lg font-semibold text-[#243653]">{settingsForm.source_title || "Official source"}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{settingsForm.source_description || "Your source description will appear here."}</p>
                  <a href={isValidHttpUrl(settingsForm.source_url) ? settingsForm.source_url : undefined} target="_blank" rel="noopener noreferrer" onClick={(event) => { if (!isValidHttpUrl(settingsForm.source_url)) event.preventDefault(); }} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#243653] hover:underline">
                    {settingsForm.source_link_label || "Source link label"} <ExternalLink size={15} />
                  </a>
                </div>
                <p className="text-xs leading-5 text-slate-400">This preview follows the content structure of the public Resources page. The live page must read from <code>resource_page_settings</code> for saved changes to appear.</p>
              </div>
            </section>
          )}
        </>
      )}

      {/* Add/edit resource modal */}
      {showResourceEditor && (
        <Modal title={editingResource ? "Edit Resource" : "Add New Resource"} subtitle="Add an external tax guide, useful link, or downloadable document." onClose={resetResourceEditor}>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5 sm:p-6">
            <FormField label="Resource title *">
              <input value={resourceForm.title} onChange={(event) => setResourceForm({ ...resourceForm, title: event.target.value })} className={inputClass} placeholder="e.g. Bangladesh Income Tax Guide 2026" />
            </FormField>
            <FormField label="Short description">
              <textarea rows={3} value={resourceForm.description} onChange={(event) => setResourceForm({ ...resourceForm, description: event.target.value })} className={`${inputClass} resize-y`} placeholder="Briefly explain what visitors will find in this resource..." />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Category *">
                <select value={resourceForm.category_id} onChange={(event) => setResourceForm({ ...resourceForm, category_id: event.target.value })} className={inputClass}>
                  <option value="">Select category</option>
                  {categories.filter((category) => category.enabled || category.id === editingResource?.category_id).map((category) => <option key={category.id} value={category.id}>{category.name}{category.enabled ? "" : " (Disabled)"}</option>)}
                </select>
              </FormField>
              <FormField label="Display order">
                <input type="number" value={resourceForm.display_order} onChange={(event) => setResourceForm({ ...resourceForm, display_order: event.target.value })} className={inputClass} />
                <p className="mt-1 text-xs text-slate-400">Lower numbers appear first.</p>
              </FormField>
            </div>
            <FormField label="External resource URL">
              <div className="relative">
                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="url" value={resourceForm.external_url} onChange={(event) => setResourceForm({ ...resourceForm, external_url: event.target.value })} className={`${inputClass} pl-9`} placeholder="https://example.com/tax-guide" />
              </div>
              <p className="mt-1 text-xs text-slate-400">Add the website or official document URL. You may also upload a file below.</p>
            </FormField>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Optional downloadable document</label>
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={(event) => handleFileChange(event.target.files?.[0])} className="hidden" id="resource-file-upload" />
                <label htmlFor="resource-file-upload" className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#B7792B] shadow-sm"><FileUp size={21} /></div>
                  <span className="text-sm font-medium text-[#243653]">Choose a document to upload</span>
                  <span className="text-xs text-slate-400">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX · Maximum 10 MB</span>
                </label>
                {selectedFile && (
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2"><FileText size={17} className="shrink-0 text-[#B7792B]" /><span className="truncate text-sm text-slate-700">{selectedFile.name}</span></div>
                    <button type="button" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-slate-400 hover:text-red-600" aria-label="Remove selected file"><X size={16} /></button>
                  </div>
                )}
                {!selectedFile && editingResource?.file_name && !removeCurrentFile && (
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <span className="truncate text-sm text-slate-600">Current file: {editingResource.file_name}</span>
                    <button type="button" onClick={() => setRemoveCurrentFile(true)} className="shrink-0 text-xs font-medium text-red-600 hover:underline">Remove</button>
                  </div>
                )}
                {removeCurrentFile && <p className="mt-3 text-xs text-amber-700">The existing uploaded file will be removed when you save.</p>}
              </div>
            </div>
            <FormField label="Last verified date">
              <input type="date" value={resourceForm.last_verified_at} onChange={(event) => setResourceForm({ ...resourceForm, last_verified_at: event.target.value })} className={inputClass} />
              <p className="mt-1 text-xs text-slate-400">Optional. Useful for tax and regulatory information that may change.</p>
            </FormField>
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">
              <div><p className="text-sm font-medium text-[#243653]">Publish resource</p><p className="mt-1 text-xs text-slate-500">Published resources can appear on the public website.</p></div>
              <input type="checkbox" checked={resourceForm.enabled} onChange={(event) => setResourceForm({ ...resourceForm, enabled: event.target.checked })} className="h-4 w-4 accent-[#243653]" />
            </label>
            {resourceError && <InlineError>{resourceError}</InlineError>}
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button type="button" onClick={resetResourceEditor} disabled={saveResourceMutation.isPending} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={() => { setResourceError(""); saveResourceMutation.mutate(); }} disabled={saveResourceMutation.isPending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1b2940] disabled:cursor-not-allowed disabled:opacity-60">
              {saveResourceMutation.isPending && <Loader2 size={16} className="animate-spin" />}{editingResource ? "Save Changes" : "Add Resource"}
            </button>
          </div>
        </Modal>
      )}

      {/* Add/edit category modal */}
      {showCategoryEditor && (
        <Modal title={editingCategory ? "Edit Category" : "Add Category"} subtitle="Categories are displayed on the public Resources page." onClose={() => setShowCategoryEditor(false)}>
          <div className="space-y-4 p-5 sm:p-6">
            <FormField label="Category name *"><input value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} className={inputClass} placeholder="e.g. Income Tax Guides" /></FormField>
            <FormField label="Display order"><input type="number" value={categoryForm.display_order} onChange={(event) => setCategoryForm({ ...categoryForm, display_order: event.target.value })} className={inputClass} /></FormField>
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4"><div><p className="text-sm font-medium text-[#243653]">Show category on website</p><p className="mt-1 text-xs text-slate-500">Disabled categories are hidden from public visitors.</p></div><input type="checkbox" checked={categoryForm.enabled} onChange={(event) => setCategoryForm({ ...categoryForm, enabled: event.target.checked })} className="h-4 w-4 accent-[#243653]" /></label>
            {categoryError && <InlineError>{categoryError}</InlineError>}
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button type="button" onClick={() => setShowCategoryEditor(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={() => { setCategoryError(""); saveCategoryMutation.mutate(); }} disabled={saveCategoryMutation.isPending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1b2940] disabled:opacity-60">{saveCategoryMutation.isPending && <Loader2 size={16} className="animate-spin" />}{editingCategory ? "Save Changes" : "Add Category"}</button>
          </div>
        </Modal>
      )}

      {/* Delete confirmations */}
      {deleteResourceTarget && (
        <ConfirmDelete
          title="Delete this resource?"
          description={<>Are you sure you want to delete <strong className="text-slate-700">{deleteResourceTarget.title}</strong>? This action cannot be undone.</>}
          pending={deleteResourceMutation.isPending}
          onCancel={() => setDeleteResourceTarget(null)}
          onConfirm={() => deleteResourceMutation.mutate(deleteResourceTarget)}
        />
      )}
      {deleteCategoryTarget && (
        <ConfirmDelete
          title="Delete this category?"
          description={<>Are you sure you want to delete <strong className="text-slate-700">{deleteCategoryTarget.name}</strong>? Categories containing resources cannot be deleted.</>}
          pending={deleteCategoryMutation.isPending}
          onCancel={() => setDeleteCategoryTarget(null)}
          onConfirm={() => deleteCategoryMutation.mutate(deleteCategoryTarget)}
        />
      )}
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#B7792B] focus:ring-2 focus:ring-[#B7792B]/10";

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return <div><label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>{children}</div>;
}

function InlineError({ children }: { children: ReactNode }) {
  return <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span>{children}</span></div>;
}

function StatusPill({ enabled }: { enabled: boolean }) {
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${enabled ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>{enabled ? "Published" : "Hidden"}</span>;
}

function EmptyState({ icon, title, description, action, onAction }: { icon: ReactNode; title: string; description: string; action?: string; onAction?: () => void }) {
  return <div className="flex flex-col items-center px-5 py-16 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">{icon}</div><h3 className="mt-4 font-semibold text-[#243653]">{title}</h3><p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>{action && onAction && <button type="button" onClick={onAction} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#243653] px-4 py-2 text-sm font-medium text-white hover:bg-[#1b2940]"><Plus size={16} />{action}</button>}</div>;
}

function Modal({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"><div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="text-lg font-semibold text-[#243653]">{title}</h2><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close dialog"><X size={19} /></button></div>{children}</div></div>;
}

function ConfirmDelete({ title, description, pending, onCancel, onConfirm }: { title: string; description: ReactNode; pending: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 size={22} /></div><h2 className="mt-4 text-lg font-semibold text-[#243653]">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} disabled={pending} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button><button type="button" onClick={onConfirm} disabled={pending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60">{pending && <Loader2 size={16} className="animate-spin" />}Delete</button></div></div></div>;
}
