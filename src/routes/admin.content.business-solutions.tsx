
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Search,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  GripVertical,
  FileText,
  Users,
  ListChecks,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute(
  "/admin/content/business-solutions"
)({
  component: BusinessSolutionsPage,
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
  display_order: number;
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
  display_order: 0,
  enabled: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toLines(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toForm(service: Service): ServiceForm {
  return {
    title: service.title ?? "",
    slug: service.slug ?? "",
    short_description: service.short_description ?? "",
    full_description: service.full_description ?? "",
    who_needs: (service.who_needs ?? []).join("\n"),
    help_with: (service.help_with ?? []).join("\n"),
    documents: (service.documents ?? []).join("\n"),
    display_order: service.display_order ?? 0,
    enabled: service.enabled ?? true,
  };
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[#243653]">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10";

const textareaClass =
  "w-full min-h-28 resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10";

function BusinessSolutionsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const servicesQuery = useQuery({
    queryKey: ["admin-business-solutions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select(
          "id, title, slug, short_description, full_description, who_needs, help_with, documents, display_order, enabled, updated_at"
        )
        .order("display_order", { ascending: true });

      if (error) throw error;
      return (data ?? []) as Service[];
    },
  });

  const services = servicesQuery.data ?? [];

  const filteredServices = services.filter((service) => {
    const searchValue = search.toLowerCase();

    return (
      service.title.toLowerCase().includes(searchValue) ||
      service.slug.toLowerCase().includes(searchValue) ||
      service.short_description.toLowerCase().includes(searchValue)
    );
  });

  const enabledCount = services.filter((service) => service.enabled).length;
  const disabledCount = services.length - enabledCount;

  function updateField<K extends keyof ServiceForm>(
    field: K,
    value: ServiceForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function openCreateForm() {
    setEditingService(null);
    setForm({
      ...emptyForm,
      display_order: services.length + 1,
    });
    setFormError("");
    setNotice("");
    setShowForm(true);
  }

  function openEditForm(service: Service) {
    setEditingService(service);
    setForm(toForm(service));
    setFormError("");
    setNotice("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingService(null);
    setForm(emptyForm);
    setFormError("");
  }

  const saveMutation = useMutation({
    mutationFn: async (values: ServiceForm) => {
      const payload = {
        title: values.title.trim(),
        slug: values.slug.trim() || slugify(values.title),
        short_description: values.short_description.trim(),
        full_description: values.full_description.trim(),
        who_needs: toLines(values.who_needs),
        help_with: toLines(values.help_with),
        documents: toLines(values.documents),
        display_order: Number(values.display_order),
        enabled: values.enabled,
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

      closeForm();
      setNotice(
        editingService
          ? "Service updated successfully."
          : "New service added successfully."
      );
    },
    onError: (error: Error) => {
      setFormError(error.message || "Something went wrong. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-business-solutions"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["services"],
      });

      setNotice("Service deleted successfully.");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({
      id,
      enabled,
    }: {
      id: string;
      enabled: boolean;
    }) => {
      const { error } = await supabase
        .from("services")
        .update({
          enabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-business-solutions"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["services"],
      });
    },
  });

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setNotice("");

    if (!form.title.trim()) {
      setFormError("Please enter a service title.");
      return;
    }

    if (!form.short_description.trim()) {
      setFormError("Please enter a short description.");
      return;
    }

    if (form.slug.trim() && !/^[a-z0-9-]+$/.test(form.slug.trim())) {
      setFormError(
        "The URL slug can only contain lowercase letters, numbers, and hyphens."
      );
      return;
    }

    if (!Number.isFinite(Number(form.display_order))) {
      setFormError("Please enter a valid display order.");
      return;
    }

    saveMutation.mutate(form);
  }

  function handleDelete(service: Service) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${service.title}"? This action cannot be undone.`
    );

    if (confirmed) {
      deleteMutation.mutate(service.id);
    }
  }

  if (servicesQuery.isLoading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading business solutions...
        </div>
      </div>
    );
  }

  if (servicesQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <h2 className="font-semibold">Unable to load services</h2>
        </div>
        <p className="mt-2 text-sm text-red-600">
          {servicesQuery.error.message}
        </p>
        <button
          onClick={() => servicesQuery.refetch()}
          className="mt-4 rounded-lg bg-[#243653] px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 pb-12">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#B7792B]">
            <BriefcaseBusiness className="h-4 w-4" />
            Website Content
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#243653] sm:text-3xl">
            Business Solutions
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage the services displayed on your public website. Add new
            solutions, update descriptions, organize their order, and control
            their visibility.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#243653] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1b2a42]"
        >
          <Plus className="h-4 w-4" />
          Add Business Solution
        </button>
      </div>

      {/* Feedback */}
      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {notice}
          <button
            onClick={() => setNotice("")}
            className="ml-auto rounded p-1 hover:bg-emerald-100"
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {deleteMutation.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to delete this service: {deleteMutation.error.message}
        </div>
      )}

      {toggleMutation.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to update service visibility: {toggleMutation.error.message}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total Solutions"
          value={services.length}
          icon={<BriefcaseBusiness className="h-5 w-5" />}
        />
        <SummaryCard
          label="Visible on Website"
          value={enabledCount}
          icon={<Eye className="h-5 w-5" />}
          accent="green"
        />
        <SummaryCard
          label="Hidden Solutions"
          value={disabledCount}
          icon={<EyeOff className="h-5 w-5" />}
          accent="amber"
        />
      </div>

      {/* Editor */}
      {showForm && (
        <section
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          id="business-solution-editor"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#B7792B]">
                Solution Editor
              </p>
              <h2 className="mt-1 text-lg font-bold text-[#243653]">
                {editingService ? "Edit Solution" : "Create New Solution"}
              </h2>
            </div>

            <button
              onClick={closeForm}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close editor"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-7 p-5 sm:p-7">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Solution Title *">
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(event) => {
                    const title = event.target.value;
                    setForm((previous) => ({
                      ...previous,
                      title,
                      slug:
                        !editingService ||
                        previous.slug === slugify(previous.title)
                          ? slugify(title)
                          : previous.slug,
                    }));
                  }}
                  placeholder="e.g. Corporate Tax Consultancy"
                  required
                />
              </Field>

              <Field
                label="URL Slug"
                hint="Used in the service URL. Use lowercase letters, numbers, and hyphens."
              >
                <input
                  className={inputClass}
                  value={form.slug}
                  onChange={(event) =>
                    updateField("slug", event.target.value.toLowerCase())
                  }
                  placeholder="corporate-tax-consultancy"
                />
              </Field>
            </div>

            <Field
              label="Short Description *"
              hint="A concise description for the service card on the public website."
            >
              <textarea
                className={textareaClass}
                rows={3}
                value={form.short_description}
                onChange={(event) =>
                  updateField("short_description", event.target.value)
                }
                placeholder="Write a short introduction to this solution..."
                required
              />
            </Field>

            <Field
              label="Full Description"
              hint="Provide the complete service description. Keep it clear and customer-friendly."
            >
              <textarea
                className={textareaClass}
                rows={5}
                value={form.full_description}
                onChange={(event) =>
                  updateField("full_description", event.target.value)
                }
                placeholder="Explain what this service includes..."
              />
            </Field>

            <div className="grid gap-6 lg:grid-cols-3">
              <Field
                label="Who Needs This Service?"
                hint="Enter one item per line."
              >
                <textarea
                  className={textareaClass}
                  rows={5}
                  value={form.who_needs}
                  onChange={(event) =>
                    updateField("who_needs", event.target.value)
                  }
                  placeholder={
                    "Private limited companies\nStartups\nGrowing businesses"
                  }
                />
              </Field>

              <Field
                label="How We Help"
                hint="Enter one item per line."
              >
                <textarea
                  className={textareaClass}
                  rows={5}
                  value={form.help_with}
                  onChange={(event) =>
                    updateField("help_with", event.target.value)
                  }
                  placeholder={
                    "Tax planning\nReturn preparation\nCompliance support"
                  }
                />
              </Field>

              <Field
                label="Required Documents"
                hint="Enter one document per line."
              >
                <textarea
                  className={textareaClass}
                  rows={5}
                  value={form.documents}
                  onChange={(event) =>
                    updateField("documents", event.target.value)
                  }
                  placeholder={
                    "Trade license\nTIN certificate\nFinancial statements"
                  }
                />
              </Field>
            </div>

            <div className="grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
              <Field
                label="Display Order"
                hint="Smaller numbers appear earlier on the website."
              >
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.display_order}
                  onChange={(event) =>
                    updateField(
                      "display_order",
                      Number(event.target.value)
                    )
                  }
                />
              </Field>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[#243653]">
                    Publish this solution
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Visible to website visitors when enabled.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => updateField("enabled", !form.enabled)}
                  className={`relative h-6 w-11 rounded-full transition ${
                    form.enabled ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                  role="switch"
                  aria-checked={form.enabled}
                  aria-label="Toggle solution visibility"
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                      form.enabled ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {formError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#243653] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1b2a42] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saveMutation.isPending
                  ? "Saving..."
                  : editingService
                    ? "Save Changes"
                    : "Create Solution"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Search and list */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-bold text-[#243653]">All Business Solutions</h2>
            <p className="mt-1 text-xs text-slate-500">
              Manage the services available on your public website.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search solutions..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#243653]"
            />
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold text-[#243653]">
              {search ? "No matching solutions" : "No business solutions yet"}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              {search
                ? "Try another search term."
                : "Start by adding your first business solution."}
            </p>
            {!search && (
              <button
                onClick={openCreateForm}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#243653] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Add First Solution
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredServices.map((service) => (
              <article
                key={service.id}
                className="p-5 transition hover:bg-slate-50/70 sm:px-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <div className="mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 sm:flex">
                      <GripVertical className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-[#243653]">
                          {service.title}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            service.enabled
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {service.enabled ? "Published" : "Hidden"}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                          Order: {service.display_order}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        /{service.slug}
                      </p>

                      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                        {service.short_description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {service.who_needs?.length ?? 0} audience items
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <ListChecks className="h-3.5 w-3.5" />
                          {service.help_with?.length ?? 0} support items
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          {service.documents?.length ?? 0} documents
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-100 pt-3 lg:border-0 lg:pt-0">
                    <button
                      onClick={() =>
                        toggleMutation.mutate({
                          id: service.id,
                          enabled: !service.enabled,
                        })
                      }
                      disabled={toggleMutation.isPending}
                      title={
                        service.enabled ? "Hide from website" : "Publish"
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                      {service.enabled ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      {service.enabled ? "Hide" : "Publish"}
                    </button>

                    <button
                      onClick={() => openEditForm(service)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#243653] transition hover:bg-slate-100"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(service)}
                      disabled={deleteMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            Showing {filteredServices.length} of {services.length} solutions
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sorted by display order
          </span>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  accent = "navy",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: "navy" | "green" | "amber";
}) {
  const styles = {
    navy: "bg-[#243653]/10 text-[#243653]",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`rounded-xl p-2.5 ${styles[accent]}`}>{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-[#243653]">
        {value}
      </p>
    </div>
  );
}
