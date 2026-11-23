
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  FileQuestion,
  FolderOpen,
  LoaderCircle,
  PencilLine,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { faqGroups } from "@/content/faqs";

export const Route = createFileRoute("/admin/content/faqs")({
  component: AdminFAQs,
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

const DEFAULT_CATEGORIES = [
  "Individual Tax",
  "Corporate Tax",
  "VAT",
  "Business Registration",
  "Foreign Investors",
  "Training",
];

const emptyForm: FAQForm = {
  question: "",
  answer: "",
  category: "Individual Tax",
  display_order: 0,
  enabled: true,
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#B7792B] focus:ring-2 focus:ring-[#B7792B]/10";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2a42] disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

function AdminFAQs() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FAQForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [renamingCategory, setRenamingCategory] = useState<string | null>(
    null
  );
  const [newCategoryName, setNewCategoryName] = useState("");

  // --------------------------------------------------
  // FETCH FAQs
  // --------------------------------------------------

  const {
    data: faqs = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select(
          "id, question, answer, category, display_order, enabled, created_at, updated_at"
        )
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;

      return (data ?? []) as FAQ[];
    },
  });

  const refreshFAQs = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
    await queryClient.invalidateQueries({ queryKey: ["public-faqs"] });
  };

  const showSuccess = (message: string) => {
    setNotice(message);
    setErrorMessage("");
  };

  const showError = (error: unknown) => {
    setErrorMessage(
      error instanceof Error ? error.message : "Something went wrong."
    );
    setNotice("");
  };

  // --------------------------------------------------
  // CATEGORY LIST
  // --------------------------------------------------

  const categories = useMemo(() => {
    const existingCategories = faqs.map((faq) => faq.category);

    return Array.from(
      new Set([...DEFAULT_CATEGORIES, ...existingCategories])
    ).sort((a, b) => {
      const aIndex = DEFAULT_CATEGORIES.indexOf(a);
      const bIndex = DEFAULT_CATEGORIES.indexOf(b);

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      return a.localeCompare(b);
    });
  }, [faqs]);

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------

  const totalFAQs = faqs.length;
  const publishedCount = faqs.filter((faq) => faq.enabled).length;
  const hiddenCount = totalFAQs - publishedCount;
  const categoryCount = new Set(faqs.map((faq) => faq.category)).size;

  // --------------------------------------------------
  // FILTER FAQs
  // --------------------------------------------------

  const filteredFAQs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesSearch =
        !term ||
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term) ||
        faq.category.toLowerCase().includes(term);

      const matchesCategory =
        categoryFilter === "all" || faq.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [faqs, search, categoryFilter]);

  const groupedFAQs = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        items: filteredFAQs
          .filter((faq) => faq.category === category)
          .sort(
            (a, b) =>
              a.display_order - b.display_order ||
              a.created_at.localeCompare(b.created_at)
          ),
      }))
      .filter((group) => group.items.length > 0);
  }, [categories, filteredFAQs]);

  // --------------------------------------------------
  // CREATE / UPDATE FAQ
  // --------------------------------------------------

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        category: form.category.trim(),
        display_order: Number(form.display_order) || 0,
        enabled: form.enabled,
        updated_at: new Date().toISOString(),
      };

      if (!payload.question || !payload.answer || !payload.category) {
        throw new Error("Please complete all required fields.");
      }

      if (editingId) {
        const { error } = await supabase
          .from("faqs")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;

        return "FAQ updated successfully.";
      }

      const { error } = await supabase.from("faqs").insert(payload);

      if (error) throw error;

      return "New FAQ created successfully.";
    },

    onSuccess: async (message) => {
      await refreshFAQs();
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      showSuccess(message);
    },

    onError: showError,
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    setErrorMessage("");
    saveMutation.mutate();
  };

  const startEdit = (faq: FAQ) => {
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      display_order: faq.display_order,
      enabled: faq.enabled,
    });

    setEditingId(faq.id);
    setShowForm(true);
    setNotice("");
    setErrorMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  // --------------------------------------------------
  // DELETE FAQ
  // --------------------------------------------------

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faqs").delete().eq("id", id);

      if (error) throw error;
    },

    onSuccess: async () => {
      await refreshFAQs();
      showSuccess("FAQ deleted successfully.");
    },

    onError: showError,
  });

  const handleDelete = (faq: FAQ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this question?\n\n${faq.question}`
    );

    if (confirmed) {
      deleteMutation.mutate(faq.id);
    }
  };

  // --------------------------------------------------
  // PUBLISH / HIDE FAQ
  // --------------------------------------------------

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

    onSuccess: async (_, variables) => {
      await refreshFAQs();

      showSuccess(
        variables.enabled
          ? "FAQ published successfully."
          : "FAQ hidden from the public website."
      );
    },

    onError: showError,
  });

  // --------------------------------------------------
  // REORDER FAQs WITHIN THEIR OWN CATEGORY
  // --------------------------------------------------

  const orderMutation = useMutation({
    mutationFn: async ({
      currentFAQ,
      direction,
    }: {
      currentFAQ: FAQ;
      direction: "up" | "down";
    }) => {
      const categoryFAQs = faqs
        .filter((faq) => faq.category === currentFAQ.category)
        .sort(
          (a, b) =>
            a.display_order - b.display_order ||
            a.created_at.localeCompare(b.created_at)
        );

      const currentIndex = categoryFAQs.findIndex(
        (faq) => faq.id === currentFAQ.id
      );

      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (
        currentIndex < 0 ||
        targetIndex < 0 ||
        targetIndex >= categoryFAQs.length
      ) {
        return;
      }

      const targetFAQ = categoryFAQs[targetIndex];

      const { error: firstError } = await supabase
        .from("faqs")
        .update({
          display_order: targetFAQ.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentFAQ.id);

      if (firstError) throw firstError;

      const { error: secondError } = await supabase
        .from("faqs")
        .update({
          display_order: currentFAQ.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetFAQ.id);

      if (secondError) throw secondError;
    },

    onSuccess: async () => {
      await refreshFAQs();
      showSuccess("FAQ order updated.");
    },

    onError: showError,
  });

  // --------------------------------------------------
  // RENAME CATEGORY
  // --------------------------------------------------

  const renameCategoryMutation = useMutation({
    mutationFn: async ({
      oldName,
      newName,
    }: {
      oldName: string;
      newName: string;
    }) => {
      const { error } = await supabase
        .from("faqs")
        .update({
          category: newName,
          updated_at: new Date().toISOString(),
        })
        .eq("category", oldName);

      if (error) throw error;
    },

    onSuccess: async () => {
      await refreshFAQs();
      setRenamingCategory(null);
      setNewCategoryName("");
      showSuccess("Category renamed successfully.");
    },

    onError: showError,
  });

  const handleRenameCategory = (oldName: string) => {
    const newName = newCategoryName.trim();

    if (!newName) {
      showError(new Error("Please enter a category name."));
      return;
    }

    if (newName === oldName) {
      setRenamingCategory(null);
      return;
    }

    if (
      categories.some(
        (category) =>
          category.toLowerCase() === newName.toLowerCase()
      )
    ) {
      showError(new Error("A category with this name already exists."));
      return;
    }

    renameCategoryMutation.mutate({ oldName, newName });
  };

  // --------------------------------------------------
  // IMPORT STARTER FAQs FROM src/content/faqs.ts
  // --------------------------------------------------

  const importMutation = useMutation({
    mutationFn: async () => {
      const { data: existingFAQs, error } = await supabase
        .from("faqs")
        .select("question, category");

      if (error) throw error;

      const existingKeys = new Set(
        (existingFAQs ?? []).map(
          (faq) =>
            `${faq.category.trim().toLowerCase()}::${faq.question
              .trim()
              .toLowerCase()}`
        )
      );

      const starterFAQs = faqGroups.flatMap((group) =>
        group.items.map((item, index) => ({
          question: item.q.trim(),
          answer: item.a.trim(),
          category: group.category,
          display_order: index + 1,
          enabled: true,
        }))
      );

      const missingFAQs = starterFAQs.filter(
        (faq) =>
          !existingKeys.has(
            `${faq.category.toLowerCase()}::${faq.question.toLowerCase()}`
          )
      );

      if (missingFAQs.length === 0) {
        return {
          inserted: 0,
          message: "All starter FAQs are already in your database.",
        };
      }

      const { error: insertError } = await supabase
        .from("faqs")
        .insert(missingFAQs);

      if (insertError) throw insertError;

      return {
        inserted: missingFAQs.length,
        message: `${missingFAQs.length} starter FAQs imported successfully.`,
      };
    },

    onSuccess: async (result) => {
      await refreshFAQs();
      showSuccess(result.message);
    },

    onError: showError,
  });

  const handleImportStarterFAQs = () => {
    const confirmed = window.confirm(
      "Import the 24 starter FAQs from src/content/faqs.ts?\n\nExisting questions in the same category will be skipped. Existing answers will not be overwritten."
    );

    if (confirmed) {
      importMutation.mutate();
    }
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="space-y-7 pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#B7792B]">
            <FileQuestion className="h-4 w-4" />
            Website Content Management
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#243653] sm:text-3xl">
            Frequently Asked Questions
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage the questions and answers displayed on your public FAQ
            page. Organize them by category, publish useful answers, and
            control their display order.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleImportStarterFAQs}
            disabled={importMutation.isPending}
            className={secondaryButton}
          >
            {importMutation.isPending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Import Starter FAQs
          </button>

          <button
            type="button"
            onClick={() => {
              if (showForm && !editingId) {
                cancelEdit();
              } else {
                setForm(emptyForm);
                setEditingId(null);
                setShowForm(true);
                setNotice("");
                setErrorMessage("");
              }
            }}
            className={primaryButton}
          >
            <Plus className="h-4 w-4" />
            Add New FAQ
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      {notice && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{notice}</p>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="ml-auto"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{errorMessage}</p>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="ml-auto"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <SummaryCard
          label="Total FAQs"
          value={totalFAQs}
          description="All stored questions"
          icon={<FileQuestion className="h-5 w-5" />}
        />

        <SummaryCard
          label="Categories"
          value={categoryCount}
          description="Categories with FAQs"
          icon={<FolderOpen className="h-5 w-5" />}
        />

        <SummaryCard
          label="Published"
          value={publishedCount}
          description="Visible to visitors"
          icon={<Eye className="h-5 w-5" />}
          valueClass="text-emerald-700"
        />

        <SummaryCard
          label="Hidden"
          value={hiddenCount}
          description="Not visible publicly"
          icon={<EyeOff className="h-5 w-5" />}
          valueClass="text-amber-700"
        />
      </div>

      {/* FAQ EDITOR */}
      {showForm && (
        <section
          id="faq-editor"
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
            <div>
              <h2 className="font-semibold text-[#243653]">
                {editingId ? "Edit FAQ" : "Create New FAQ"}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Add a question and its answer to your website.
              </p>
            </div>

            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
              aria-label="Close editor"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="faq-category"
                  className="text-sm font-medium text-slate-700"
                >
                  Category <span className="text-red-500">*</span>
                </label>

                <input
                  id="faq-category"
                  list="faq-category-options"
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category: event.target.value,
                    })
                  }
                  placeholder="e.g. Individual Tax"
                  className={inputClass}
                  required
                />

                <datalist id="faq-category-options">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>

                <p className="text-xs text-slate-400">
                  Choose an existing category or enter a new one.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="faq-order"
                  className="text-sm font-medium text-slate-700"
                >
                  Display Order
                </label>

                <input
                  id="faq-order"
                  type="number"
                  min="0"
                  value={form.display_order}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      display_order: Number(event.target.value),
                    })
                  }
                  className={inputClass}
                />

                <p className="text-xs text-slate-400">
                  Lower numbers appear earlier within the category.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="faq-question"
                className="text-sm font-medium text-slate-700"
              >
                Question <span className="text-red-500">*</span>
              </label>

              <input
                id="faq-question"
                value={form.question}
                onChange={(event) =>
                  setForm({
                    ...form,
                    question: event.target.value,
                  })
                }
                placeholder="Enter the frequently asked question"
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="faq-answer"
                className="text-sm font-medium text-slate-700"
              >
                Answer <span className="text-red-500">*</span>
              </label>

              <textarea
                id="faq-answer"
                value={form.answer}
                onChange={(event) =>
                  setForm({
                    ...form,
                    answer: event.target.value,
                  })
                }
                placeholder="Write a clear and helpful answer..."
                rows={6}
                className={`${inputClass} resize-y leading-6`}
                required
              />

              <p className="text-xs text-slate-400">
                Keep answers clear, accurate, and easy for visitors to
                understand.
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(event) =>
                  setForm({
                    ...form,
                    enabled: event.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-slate-300 accent-[#243653]"
              />

              <span>
                <span className="block text-sm font-medium text-slate-700">
                  Publish this FAQ
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Published FAQs can be displayed on the public website.
                </span>
              </span>
            </label>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={cancelEdit}
                className={secondaryButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saveMutation.isPending}
                className={primaryButton}
              >
                {saveMutation.isPending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {editingId ? "Save Changes" : "Create FAQ"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* CATEGORY MANAGEMENT */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-[#243653]">
              Category Management
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Rename categories and organize related questions.
            </p>
          </div>

          <span className="text-xs text-slate-400">
            {categories.length} available categories
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const count = faqs.filter(
              (faq) => faq.category === category
            ).length;

            const isRenaming = renamingCategory === category;

            return (
              <div
                key={category}
                className="rounded-lg border border-slate-200 p-3"
              >
                {isRenaming ? (
                  <div className="space-y-2">
                    <input
                      value={newCategoryName}
                      onChange={(event) =>
                        setNewCategoryName(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleRenameCategory(category);
                        }
                        if (event.key === "Escape") {
                          setRenamingCategory(null);
                        }
                      }}
                      className={inputClass}
                      autoFocus
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleRenameCategory(category)}
                        disabled={renameCategoryMutation.isPending}
                        className={`${primaryButton} flex-1`}
                      >
                        <Check className="h-4 w-4" />
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRenamingCategory(null);
                          setNewCategoryName("");
                        }}
                        className={secondaryButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {category}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {count} {count === 1 ? "question" : "questions"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setRenamingCategory(category);
                        setNewCategoryName(category);
                        setNotice("");
                        setErrorMessage("");
                      }}
                      className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-amber-50 hover:text-[#B7792B]"
                      title="Rename category"
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-400">
          Categories are stored through the FAQs assigned to them. A
          category with no questions is not stored independently in the
          current database structure.
        </p>
      </section>

      {/* FAQ LIST */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-[#243653]">
                All Frequently Asked Questions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review, edit, publish, hide, reorder, or delete questions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              className={secondaryButton}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_230px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search questions, answers, or categories..."
                className={`${inputClass} pl-9`}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className={inputClass}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <LoaderCircle className="mb-3 h-7 w-7 animate-spin text-[#B7792B]" />
            <p className="text-sm">Loading FAQs...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
            <p className="font-medium text-slate-800">
              Unable to load FAQs
            </p>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              {error instanceof Error
                ? error.message
                : "Please check your database connection and admin permissions."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className={`${primaryButton} mt-4`}
            >
              Try Again
            </button>
          </div>
        ) : filteredFAQs.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <FileQuestion className="mb-3 h-9 w-9 text-slate-300" />

            <p className="font-medium text-slate-700">
              {faqs.length === 0
                ? "No FAQs have been added yet."
                : "No matching FAQs found."}
            </p>

            <p className="mt-2 max-w-md text-sm text-slate-400">
              {faqs.length === 0
                ? "Add your first question or import the starter FAQs from your existing content."
                : "Try another search term or change the category filter."}
            </p>

            {faqs.length === 0 && (
              <button
                type="button"
                onClick={handleImportStarterFAQs}
                disabled={importMutation.isPending}
                className={`${primaryButton} mt-4`}
              >
                <RefreshCw className="h-4 w-4" />
                Import Starter FAQs
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {groupedFAQs.map((group) => (
              <div key={group.category}>
                <div className="flex items-center justify-between gap-3 bg-slate-50 px-5 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <FolderOpen className="h-4 w-4 shrink-0 text-[#B7792B]" />
                    <h3 className="truncate text-sm font-semibold text-[#243653]">
                      {group.category}
                    </h3>
                  </div>

                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500">
                    {group.items.length}{" "}
                    {group.items.length === 1 ? "FAQ" : "FAQs"}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {group.items.map((faq, index) => {
                    const first = index === 0;
                    const last = index === group.items.length - 1;

                    return (
                      <article
                        key={faq.id}
                        className="p-5 transition hover:bg-slate-50/60"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className="text-xs font-semibold text-[#B7792B]">
                                Q{index + 1}
                              </span>

                              {faq.enabled ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                                  <Eye className="h-3 w-3" />
                                  Published
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                                  <EyeOff className="h-3 w-3" />
                                  Hidden
                                </span>
                              )}
                            </div>

                            <h4 className="font-semibold leading-6 text-[#243653]">
                              {faq.question}
                            </h4>

                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-500">
                              {faq.answer}
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-wrap items-center gap-1 lg:justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                orderMutation.mutate({
                                  currentFAQ: faq,
                                  direction: "up",
                                })
                              }
                              disabled={
                                first ||
                                orderMutation.isPending ||
                                categoryFilter === "all" && !!search.trim()
                              }
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#243653] disabled:cursor-not-allowed disabled:opacity-30"
                              title="Move up within category"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                orderMutation.mutate({
                                  currentFAQ: faq,
                                  direction: "down",
                                })
                              }
                              disabled={
                                last ||
                                orderMutation.isPending ||
                                categoryFilter === "all" && !!search.trim()
                              }
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#243653] disabled:cursor-not-allowed disabled:opacity-30"
                              title="Move down within category"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                visibilityMutation.mutate({
                                  id: faq.id,
                                  enabled: !faq.enabled,
                                })
                              }
                              disabled={visibilityMutation.isPending}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-amber-50 hover:text-[#B7792B]"
                              title={
                                faq.enabled
                                  ? "Hide FAQ"
                                  : "Publish FAQ"
                              }
                            >
                              {faq.enabled ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => startEdit(faq)}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
                              title="Edit FAQ"
                            >
                              <PencilLine className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(faq)}
                              disabled={deleteMutation.isPending}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                              title="Delete FAQ"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
          <p className="text-xs text-slate-500">
            Showing {filteredFAQs.length} of {totalFAQs} FAQs
          </p>
        </div>
      </section>

      {/* CONTENT NOTE */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#B7792B]" />

          <div>
            <h3 className="text-sm font-semibold text-[#243653]">
              Content and publishing note
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              The FAQ editor manages the general questions on the public
              FAQ page. The separate FAQs inside your service catalogue
              in <code>src/content/catalog.ts</code> remain service-specific
              content and are not automatically imported here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------
// SUMMARY CARD
// --------------------------------------------------

function SummaryCard({
  label,
  value,
  description,
  icon,
  valueClass = "text-[#243653]",
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={`mt-2 text-3xl font-bold ${valueClass}`}>
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <div className="rounded-lg bg-[#243653]/5 p-2.5 text-[#243653]">
          {icon}
        </div>
      </div>
    </div>
  );
}
