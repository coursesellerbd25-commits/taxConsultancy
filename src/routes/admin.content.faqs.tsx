
import { createFileRoute } from "@tanstack/react-router";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Search,
  HelpCircle,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquareText,
  Layers,
  ListOrdered,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/content/faqs")({
  component: FAQsPage,
});

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

type FAQForm = {
  question: string;
  answer: string;
  category: string;
  display_order: number;
  enabled: boolean;
};

const emptyForm: FAQForm = {
  question: "",
  answer: "",
  category: "General",
  display_order: 0,
  enabled: true,
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10";

const textareaClass =
  "w-full min-h-32 resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#243653] focus:ring-2 focus:ring-[#243653]/10";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[#243653]">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs leading-5 text-slate-500">{hint}</p>}
    </div>
  );
}

function FAQSummaryCard({
  label,
  value,
  icon,
  color = "navy",
}: {
  label: string;
  value: number;
  icon: ReactNode;
  color?: "navy" | "green" | "amber";
}) {
  const iconStyles = {
    navy: "bg-[#243653]/10 text-[#243653]",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`rounded-xl p-2.5 ${iconStyles[color]}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-[#243653]">
        {value}
      </p>
    </div>
  );
}

function FAQsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [form, setForm] = useState<FAQForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const faqsQuery = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select(
          "id, question, answer, category, display_order, enabled, created_at, updated_at"
        )
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as FAQ[];
    },
  });

  const faqs = faqsQuery.data ?? [];

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          faqs
            .map((faq) => faq.category?.trim())
            .filter((category): category is string => Boolean(category))
        )
      ).sort((a, b) => a.localeCompare(b)),
    [faqs]
  );

  const filteredFAQs = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesSearch =
        !searchValue ||
        faq.question.toLowerCase().includes(searchValue) ||
        faq.answer.toLowerCase().includes(searchValue) ||
        faq.category.toLowerCase().includes(searchValue);

      const matchesCategory =
        categoryFilter === "All" || faq.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [faqs, search, categoryFilter]);

  const publishedCount = faqs.filter((faq) => faq.enabled).length;
  const hiddenCount = faqs.length - publishedCount;

  useEffect(() => {
    if (editingFAQ) {
      setForm({
        question: editingFAQ.question,
        answer: editingFAQ.answer,
        category: editingFAQ.category,
        display_order: editingFAQ.display_order,
        enabled: editingFAQ.enabled,
      });
    }
  }, [editingFAQ]);

  function updateField<K extends keyof FAQForm>(
    field: K,
    value: FAQForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setFormError("");
  }

  function openCreateForm() {
    setEditingFAQ(null);
    setForm({
      ...emptyForm,
      display_order: faqs.length + 1,
    });
    setFormError("");
    setNotice("");
    setShowForm(true);
  }

  function openEditForm(faq: FAQ) {
    setEditingFAQ(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      display_order: faq.display_order,
      enabled: faq.enabled,
    });
    setFormError("");
    setNotice("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingFAQ(null);
    setForm(emptyForm);
    setFormError("");
  }

  async function refreshFAQs() {
    await queryClient.invalidateQueries({
      queryKey: ["admin-faqs"],
    });

    // Also refresh the public FAQ query if it uses this key.
    await queryClient.invalidateQueries({
      queryKey: ["public-faqs"],
    });
  }

  const saveMutation = useMutation({
    mutationFn: async (values: FAQForm) => {
      const payload = {
        question: values.question.trim(),
        answer: values.answer.trim(),
        category: values.category.trim() || "General",
        display_order: Number(values.display_order),
        enabled: values.enabled,
        updated_at: new Date().toISOString(),
      };

      if (editingFAQ) {
        const { error } = await supabase
          .from("faqs")
          .update(payload)
          .eq("id", editingFAQ.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("faqs").insert(payload);

        if (error) throw error;
      }
    },
    onSuccess: async () => {
      await refreshFAQs();

      setNotice(
        editingFAQ
          ? "FAQ updated successfully."
          : "New FAQ created successfully."
      );

      closeForm();
    },
    onError: (error: Error) => {
      setFormError(error.message || "Unable to save this FAQ.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refreshFAQs();
      setNotice("FAQ deleted successfully.");
    },
  });

  const visibilityMutation = useMutation({
    mutationFn: async ({
      id,
      enabled,
    }: {
      id: string;
      enabled: boolean;
    }) => {
      const { error } = await supabase
        .from("faqs")
        .update({
          enabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: refreshFAQs,
  });

  const orderMutation = useMutation({
    mutationFn: async ({
      faq,
      direction,
    }: {
      faq: FAQ;
      direction: "up" | "down";
    }) => {
      const sorted = [...faqs].sort(
        (a, b) =>
          a.display_order - b.display_order ||
          a.created_at.localeCompare(b.created_at)
      );

      const index = sorted.findIndex((item) => item.id === faq.id);
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= sorted.length) return;

      const target = sorted[targetIndex];

      const { error: firstError } = await supabase
        .from("faqs")
        .update({
          display_order: target.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", faq.id);

      if (firstError) throw firstError;

      const { error: secondError } = await supabase
        .from("faqs")
        .update({
          display_order: faq.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", target.id);

      if (secondError) throw secondError;
    },
    onSuccess: refreshFAQs,
  });

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setNotice("");

    if (!form.question.trim()) {
      setFormError("Please enter the FAQ question.");
      return;
    }

    if (!form.answer.trim()) {
      setFormError("Please enter the FAQ answer.");
      return;
    }

    if (!Number.isFinite(Number(form.display_order))) {
      setFormError("Please enter a valid display order.");
      return;
    }

    saveMutation.mutate(form);
  }

  function handleDelete(faq: FAQ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete this FAQ?\n\n"${faq.question}"\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      deleteMutation.mutate(faq.id);
    }
  }

  if (faqsQuery.isLoading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading FAQs...
        </div>
      </div>
    );
  }

  if (faqsQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <h2 className="font-semibold">Unable to load FAQs</h2>
        </div>
        <p className="mt-2 text-sm text-red-600">
          {faqsQuery.error.message}
        </p>
        <button
          onClick={() => faqsQuery.refetch()}
          className="mt-4 rounded-lg bg-[#243653] px-4 py-2 text-sm font-semibold text-white"
        >
          Try Again
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
            <HelpCircle className="h-4 w-4" />
            Website Content
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#243653] sm:text-3xl">
            Frequently Asked Questions
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Create and manage answers to common client questions. Organize
            FAQs into categories and control which answers appear publicly.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#243653] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1b2a42]"
        >
          <Plus className="h-4 w-4" />
          Add New FAQ
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

      {(deleteMutation.isError || visibilityMutation.isError || orderMutation.isError) && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {deleteMutation.error?.message ||
            visibilityMutation.error?.message ||
            orderMutation.error?.message}
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <FAQSummaryCard
          label="Total FAQs"
          value={faqs.length}
          icon={<MessageSquareText className="h-5 w-5" />}
        />
        <FAQSummaryCard
          label="Published"
          value={publishedCount}
          icon={<Eye className="h-5 w-5" />}
          color="green"
        />
        <FAQSummaryCard
          label="Hidden"
          value={hiddenCount}
          icon={<EyeOff className="h-5 w-5" />}
          color="amber"
        />
      </div>

      {/* FAQ editor */}
      {showForm && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#B7792B]">
                FAQ Editor
              </p>
              <h2 className="mt-1 text-lg font-bold text-[#243653]">
                {editingFAQ ? "Edit FAQ" : "Create New FAQ"}
              </h2>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close editor"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6 p-5 sm:p-7">
            <Field
              label="Question *"
              hint="Write the question exactly as a visitor might ask it."
            >
              <input
                className={inputClass}
                value={form.question}
                onChange={(event) =>
                  updateField("question", event.target.value)
                }
                placeholder="e.g. Who needs to file a corporate tax return?"
                required
              />
            </Field>

            <Field
              label="Answer *"
              hint="Provide a clear, helpful answer. You can use line breaks to organize longer answers."
            >
              <textarea
                className={textareaClass}
                rows={6}
                value={form.answer}
                onChange={(event) =>
                  updateField("answer", event.target.value)
                }
                placeholder="Write a helpful answer for your website visitors..."
                required
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Category"
                hint="Choose an existing category or type a new one."
              >
                <input
                  list="faq-categories"
                  className={inputClass}
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  placeholder="General"
                />
                <datalist id="faq-categories">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </Field>

              <Field
                label="Display Order"
                hint="Smaller numbers appear earlier."
              >
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.display_order}
                  onChange={(event) =>
                    updateField("display_order", Number(event.target.value))
                  }
                />
              </Field>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-[#243653]">
                  Publish this FAQ
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Published FAQs can be displayed to website visitors.
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
                aria-label="Toggle FAQ visibility"
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                    form.enabled ? "left-6" : "left-1"
                  }`}
                />
              </button>
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
                  : editingFAQ
                    ? "Save Changes"
                    : "Create FAQ"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Search and filters */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-bold text-[#243653]">All FAQs</h2>
            <p className="mt-1 text-xs text-slate-500">
              Manage questions and answers shown on your website.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search FAQs..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#243653]"
              />
            </div>

            <div className="relative sm:w-48">
              <Layers className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-700 outline-none focus:border-[#243653]"
              >
                <option value="All">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {filteredFAQs.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <HelpCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold text-[#243653]">
              {search || categoryFilter !== "All"
                ? "No matching FAQs"
                : "No FAQs created yet"}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              {search || categoryFilter !== "All"
                ? "Try changing your search or category filter."
                : "Add your first question and answer to help your website visitors."}
            </p>
            {!search && categoryFilter === "All" && (
              <button
                onClick={openCreateForm}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#243653] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Add First FAQ
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredFAQs.map((faq) => {
              const sortedFAQs = [...faqs].sort(
                (a, b) =>
                  a.display_order - b.display_order ||
                  a.created_at.localeCompare(b.created_at)
              );
              const position = sortedFAQs.findIndex(
                (item) => item.id === faq.id
              );

              return (
                <article
                  key={faq.id}
                  className="p-5 transition hover:bg-slate-50/70 sm:px-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#243653]/10 text-[#243653] sm:flex">
                        <HelpCircle className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-[#243653]">
                            {faq.question}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              faq.enabled
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {faq.enabled ? "Published" : "Hidden"}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium">
                            {faq.category}
                          </span>
                          <span>Display order: {faq.display_order}</span>
                        </div>

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                          {faq.answer}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-100 pt-3 lg:border-0 lg:pt-0">
                      <div className="flex items-center rounded-lg border border-slate-200">
                        <button
                          onClick={() =>
                            orderMutation.mutate({
                              faq,
                              direction: "up",
                            })
                          }
                          disabled={
                            position === 0 || orderMutation.isPending
                          }
                          title="Move up"
                          className="rounded-l-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <div className="border-x border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-500">
                          {position + 1}
                        </div>
                        <button
                          onClick={() =>
                            orderMutation.mutate({
                              faq,
                              direction: "down",
                            })
                          }
                          disabled={
                            position === sortedFAQs.length - 1 ||
                            orderMutation.isPending
                          }
                          title="Move down"
                          className="rounded-r-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          visibilityMutation.mutate({
                            id: faq.id,
                            enabled: !faq.enabled,
                          })
                        }
                        disabled={visibilityMutation.isPending}
                        title={faq.enabled ? "Hide FAQ" : "Publish FAQ"}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                      >
                        {faq.enabled ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        {faq.enabled ? "Hide" : "Publish"}
                      </button>

                      <button
                        onClick={() => openEditForm(faq)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#243653] transition hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(faq)}
                        disabled={deleteMutation.isPending}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            Showing {filteredFAQs.length} of {faqs.length} FAQs
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ListOrdered className="h-3.5 w-3.5" />
            Ordered by display sequence
          </span>
        </div>
      </section>
    </div>
  );
}
