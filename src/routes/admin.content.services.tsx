
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  BriefcaseBusiness,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowUpDown,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/content/services")({
  component: ServicesPage,
});

type Service = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  who_needs: string[];
  help_with: string[];
  documents: string[];
  display_order: number;
  enabled: boolean;
  updated_at: string;
};

type ServiceForm = {
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  who_needs: string;
  help_with: string;
  documents: string;
  display_order: string;
  enabled: boolean;
};

const emptyForm: ServiceForm = {
  title: "",
  slug: "",
  short_description: "",
  full_description: "",
  who_needs: "",
  help_with: "",
  documents: "",
  display_order: "0",
  enabled: true,
};

const linesToArray = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const arrayToLines = (value: string[] | null | undefined) =>
  Array.isArray(value) ? value.join("\n") : "";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function ServicesPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showEditor, setShowEditor] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const servicesQuery = useQuery({
    queryKey: ["admin-business-solutions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("display_order", { ascending: true })
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Service[];
    },
  });

  const services = servicesQuery.data ?? [];

  const filteredServices = services.filter((service) => {
    const term = search.toLowerCase();

    const matchesSearch =
      service.title.toLowerCase().includes(term) ||
      service.slug.toLowerCase().includes(term) ||
      service.short_description.toLowerCase().includes(term) ||
      service.full_description.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && service.enabled) ||
      (statusFilter === "hidden" && !service.enabled);

    return matchesSearch && matchesStatus;
  });

  const publishedCount = services.filter((service) => service.enabled).length;
  const hiddenCount = services.length - publishedCount;

  const resetEditor = () => {
    setShowEditor(false);
    setEditingService(null);
    setForm(emptyForm);
    setFormError("");
  };

  const openCreateEditor = () => {
    setEditingService(null);
    setForm(emptyForm);
    setFormError("");
    setShowEditor(true);
  };

  const openEditEditor = (service: Service) => {
    setEditingService(service);

    setForm({
      title: service.title,
      slug: service.slug,
      short_description: service.short_description ?? "",
      full_description: service.full_description ?? "",
      who_needs: arrayToLines(service.who_needs),
      help_with: arrayToLines(service.help_with),
      documents: arrayToLines(service.documents),
      display_order: String(service.display_order ?? 0),
      enabled: service.enabled,
    });

    setFormError("");
    setShowEditor(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const title = form.title.trim();
      const slug = slugify(form.slug || form.title);

      if (!title) {
        throw new Error("Please enter a service title.");
      }

      if (!slug) {
        throw new Error("Please enter a valid service slug.");
      }

      if (!form.short_description.trim()) {
        throw new Error("Please enter a short description.");
      }

      const payload = {
        title,
        slug,
        short_description: form.short_description.trim(),
        full_description: form.full_description.trim(),
        who_needs: linesToArray(form.who_needs),
        help_with: linesToArray(form.help_with),
        documents: linesToArray(form.documents),
        display_order: Number(form.display_order) || 0,
        enabled: form.enabled,
        updated_at: new Date().toISOString(),
      };

      if (editingService) {
        const { error } = await supabase
          .from("services")
          .update(payload)
          .eq("id", editingService.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("services")
          .insert(payload);

        if (error) throw error;
      }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-business-solutions"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["services"],
      });

      setNotice(
        editingService
          ? "Service updated successfully."
          : "Service created successfully."
      );

      resetEditor();
    },

    onError: (error: Error) => {
      setFormError(error.message || "Unable to save the service.");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (service: Service) => {
      const { error } = await supabase
        .from("services")
        .update({
          enabled: !service.enabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", service.id);

      if (error) throw error;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-business-solutions"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["services"],
      });

      setNotice("Service visibility updated.");
    },

    onError: (error: Error) => setNotice(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (service: Service) => {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", service.id);

      if (error) throw error;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-business-solutions"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["services"],
      });

      setDeleteTarget(null);
      setNotice("Service deleted successfully.");
    },

    onError: (error: Error) => setNotice(error.message),
  });

  const updateForm = <K extends keyof ServiceForm>(
    key: K,
    value: ServiceForm[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#B7792B]">
            <BriefcaseBusiness size={16} />
            <span>Website Content</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#243653] sm:text-3xl">
            Services Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage the tax consultancy services displayed on your public
            website. Add new services, update descriptions, and control
            publication.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateEditor}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2940]"
        >
          <Plus size={17} />
          Add Service
        </button>
      </div>

      {/* Notification */}
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

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {[
          {
            label: "Total Services",
            value: services.length,
            icon: BriefcaseBusiness,
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
            placeholder="Search services by title, slug, or description..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#B7792B] focus:ring-2 focus:ring-[#B7792B]/10"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#B7792B]"
        >
          <option value="all">All Services</option>
          <option value="published">Published</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      {/* Services list */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-[#243653]">
              Service Collection
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredServices.length} service
              {filteredServices.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ArrowUpDown size={14} />
            Ordered by display position
          </div>
        </div>

        {servicesQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            Loading services...
          </div>
        ) : servicesQuery.isError ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <AlertCircle size={28} className="text-red-500" />

            <p className="mt-3 font-medium text-[#243653]">
              Could not load services
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {servicesQuery.error.message}
            </p>

            <button
              type="button"
              onClick={() => servicesQuery.refetch()}
              className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-[#243653] hover:bg-slate-50"
            >
              Try again
            </button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <BriefcaseBusiness size={25} />
            </div>

            <h3 className="mt-4 font-semibold text-[#243653]">
              No services found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {services.length === 0
                ? "Start adding services to display your business solutions on the website."
                : "Try another search term or status filter."}
            </p>

            {services.length === 0 && (
              <button
                type="button"
                onClick={openCreateEditor}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#243653] px-4 py-2 text-sm font-medium text-white hover:bg-[#1b2940]"
              >
                <Plus size={16} />
                Add your first service
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="flex flex-col gap-4 p-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:p-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#243653]/5 text-[#243653]">
                  <BriefcaseBusiness size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[#243653]">
                      {service.title}
                    </h3>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        service.enabled
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {service.enabled ? "Published" : "Hidden"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    /{service.slug}
                  </p>

                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
                    {service.short_description ||
                      "No short description provided."}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span>Display order: {service.display_order}</span>
                    <span>
                      {service.who_needs?.length ?? 0} audience items
                    </span>
                    <span>
                      {service.documents?.length ?? 0} document items
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => toggleMutation.mutate(service)}
                    disabled={toggleMutation.isPending}
                    title={
                      service.enabled ? "Hide service" : "Publish service"
                    }
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-[#B7792B]/40 hover:text-[#B7792B] disabled:opacity-50"
                  >
                    {service.enabled ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditEditor(service)}
                    title="Edit service"
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-[#B7792B]/40 hover:text-[#B7792B]"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(service)}
                    title="Delete service"
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
          <div className="my-auto w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-[#243653]">
                  {editingService ? "Edit Service" : "Add New Service"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Manage the information visitors see on your website.
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
                  Service Title *
                </label>

                <input
                  value={form.title}
                  onChange={(event) => {
                    const title = event.target.value;

                    setForm((previous) => ({
                      ...previous,
                      title,
                      slug: editingService
                        ? previous.slug
                        : slugify(title),
                    }));
                  }}
                  placeholder="e.g. Individual Income Tax Return"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  URL Slug *
                </label>

                <input
                  value={form.slug}
                  onChange={(event) =>
                    updateForm("slug", slugify(event.target.value))
                  }
                  placeholder="individual-income-tax-return"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Used to identify the service in website URLs.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Short Description *
                </label>

                <textarea
                  rows={2}
                  value={form.short_description}
                  onChange={(event) =>
                    updateForm("short_description", event.target.value)
                  }
                  placeholder="A short summary displayed in service cards..."
                  className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full Description
                </label>

                <textarea
                  rows={5}
                  value={form.full_description}
                  onChange={(event) =>
                    updateForm("full_description", event.target.value)
                  }
                  placeholder="Describe the service in detail..."
                  className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Who Needs This Service?
                  </label>

                  <textarea
                    rows={5}
                    value={form.who_needs}
                    onChange={(event) =>
                      updateForm("who_needs", event.target.value)
                    }
                    placeholder={"Individuals\nBusiness owners\nFreelancers"}
                    className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Enter one item per line.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    How We Help
                  </label>

                  <textarea
                    rows={5}
                    value={form.help_with}
                    onChange={(event) =>
                      updateForm("help_with", event.target.value)
                    }
                    placeholder={
                      "Tax return preparation\nTax calculation\nDocumentation support"
                    }
                    className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Enter one item per line.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Required Documents
                </label>

                <textarea
                  rows={4}
                  value={form.documents}
                  onChange={(event) =>
                    updateForm("documents", event.target.value)
                  }
                  placeholder={
                    "National ID\nSalary certificate\nBank statement\nPrevious tax return"
                  }
                  className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B]"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Enter one document per line.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Display Order
                </label>

                <input
                  type="number"
                  value={form.display_order}
                  onChange={(event) =>
                    updateForm("display_order", event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#B7792B] sm:max-w-xs"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Lower numbers appear first.
                </p>
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-medium text-[#243653]">
                    Publish Service
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Published services can appear on the public website.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(event) =>
                    updateForm("enabled", event.target.checked)
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
                onClick={() => {
                  setFormError("");
                  setNotice("");
                  saveMutation.mutate();
                }}
                disabled={saveMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1b2940] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveMutation.isPending && (
                  <Loader2 size={16} className="animate-spin" />
                )}

                {editingService ? "Save Changes" : "Create Service"}
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
              Delete this service?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <strong className="text-slate-700">
                {deleteTarget.title}
              </strong>
              ? This action cannot be undone.
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
                Delete Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
