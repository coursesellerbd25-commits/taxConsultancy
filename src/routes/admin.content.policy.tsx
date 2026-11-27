
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Globe,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/content/policy")({
  component: PrivacyPolicyAdminPage,
});

type PolicySection = {
  id: string;
  heading: string;
  content: string;
};

type PolicyForm = {
  title: string;
  intro: string;
  sections: PolicySection[];
  is_published: boolean;
};

const initialForm: PolicyForm = {
  title: "Privacy Policy",
  intro: "",
  sections: [],
  is_published: true,
};

const queryKey = ["admin-legal-page", "privacy"];

function createSection(): PolicySection {
  return {
    id: crypto.randomUUID(),
    heading: "",
    content: "",
  };
}

function PrivacyPolicyAdminPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<PolicyForm>(initialForm);
  const [preview, setPreview] = useState(false);

  const policyQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_pages")
        .select("*")
        .eq("slug", "privacy")
        .maybeSingle();

      if (error) throw error;

      return data;
    },
  });

  useEffect(() => {
    const policy = policyQuery.data;

    if (!policy) return;

    setForm({
      title: policy.title ?? "Privacy Policy",
      intro: policy.intro ?? "",
      sections: Array.isArray(policy.sections)
        ? (policy.sections as PolicySection[]).map((section) => ({
            id: section.id || crypto.randomUUID(),
            heading: section.heading ?? "",
            content: section.content ?? "",
          }))
        : [],
      is_published: policy.is_published ?? true,
    });
  }, [policyQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (values: PolicyForm) => {
      const payload = {
        slug: "privacy",
        title: values.title.trim(),
        intro: values.intro.trim(),
        sections: values.sections.map((section) => ({
          id: section.id,
          heading: section.heading.trim(),
          content: section.content.trim(),
        })),
        is_published: values.is_published,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("legal_pages")
        .upsert(payload, { onConflict: "slug" });

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });

      await queryClient.invalidateQueries({
        queryKey: ["legal-page", "privacy"],
      });

      toast.success("Privacy Policy saved successfully.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save Privacy Policy.");
    },
  });

  const updateField = <K extends keyof PolicyForm>(
    key: K,
    value: PolicyForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateSection = (
    sectionId: string,
    key: "heading" | "content",
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId
          ? { ...section, [key]: value }
          : section,
      ),
    }));
  };

  const addSection = () => {
    setForm((current) => ({
      ...current,
      sections: [...current.sections, createSection()],
    }));
  };

  const deleteSection = (sectionId: string) => {
    setForm((current) => ({
      ...current,
      sections: current.sections.filter(
        (section) => section.id !== sectionId,
      ),
    }));
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("Please enter a page title.");
      return;
    }

    saveMutation.mutate(form);
  };

  const handlePublishToggle = () => {
    const nextStatus = !form.is_published;

    const updatedForm = {
      ...form,
      is_published: nextStatus,
    };

    setForm(updatedForm);
    saveMutation.mutate(updatedForm);
  };

  if (policyQuery.isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#243653]" />
      </div>
    );
  }

  if (policyQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <h2 className="font-semibold">Unable to load Privacy Policy</h2>
        </div>

        <p className="mt-2 text-sm text-red-600">
          {policyQuery.error.message}
        </p>

        <Button
          variant="outline"
          className="mt-4"
          onClick={() => policyQuery.refetch()}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#B7792B]">
            <ShieldCheck size={17} />
            <span>Legal Content Management</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#243653] sm:text-3xl">
            Privacy Policy
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Edit the privacy policy displayed on your public website.
            Manage the title, introduction, sections, and publication status.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setPreview((current) => !current)}
          >
            {preview ? (
              <>
                <EyeOff size={16} className="mr-2" />
                Back to Editor
              </>
            ) : (
              <>
                <Eye size={16} className="mr-2" />
                Preview
              </>
            )}
          </Button>

          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-[#243653] hover:bg-[#1b2940]"
          >
            {saveMutation.isPending ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Publication status */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              form.is_published
                ? "bg-green-50 text-green-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {form.is_published ? (
              <Globe size={20} />
            ) : (
              <FileText size={20} />
            )}
          </div>

          <div>
            <p className="font-semibold text-[#243653]">
              {form.is_published ? "Published" : "Unpublished"}
            </p>

            <p className="text-xs text-slate-500">
              {form.is_published
                ? "Visitors can view this policy on your website."
                : "This policy is hidden from public visitors."}
            </p>
          </div>
        </div>

        <Button
          variant={form.is_published ? "outline" : "default"}
          onClick={handlePublishToggle}
          disabled={saveMutation.isPending}
          className={
            !form.is_published
              ? "bg-[#243653] hover:bg-[#1b2940]"
              : ""
          }
        >
          {saveMutation.isPending ? (
            <Loader2 size={16} className="mr-2 animate-spin" />
          ) : form.is_published ? (
            <EyeOff size={16} className="mr-2" />
          ) : (
            <Globe size={16} className="mr-2" />
          )}

          {form.is_published ? "Unpublish" : "Publish"}
        </Button>
      </div>

      {preview ? (
        /* Preview */
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="border-b border-slate-100 pb-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#B7792B]">
                Legal
              </span>

              <h1 className="mt-2 text-3xl font-bold text-[#243653]">
                {form.title || "Untitled Policy"}
              </h1>

              {form.intro && (
                <p className="mt-4 text-base leading-7 text-slate-600">
                  {form.intro}
                </p>
              )}
            </div>

            {form.sections.map((section) => (
              <section key={section.id} className="space-y-3">
                <h2 className="text-xl font-semibold text-[#243653]">
                  {section.heading || "Untitled Section"}
                </h2>

                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {section.content || "No content added yet."}
                </p>
              </section>
            ))}

            {form.sections.length === 0 && (
              <p className="text-sm text-slate-400">
                No policy sections have been added yet.
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Editor */
        <div className="space-y-6">
          {/* Basic page information */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-[#243653]">
                Page Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Set the page title and introductory text.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="policy-title">Page Title</Label>

                <Input
                  id="policy-title"
                  value={form.title}
                  onChange={(event) =>
                    updateField("title", event.target.value)
                  }
                  placeholder="Privacy Policy"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="policy-intro">Introduction</Label>

                <Textarea
                  id="policy-intro"
                  value={form.intro}
                  onChange={(event) =>
                    updateField("intro", event.target.value)
                  }
                  placeholder="Write a brief introduction to your privacy policy..."
                  rows={4}
                />

                <p className="text-xs text-slate-400">
                  This text appears below the page title.
                </p>
              </div>
            </div>
          </div>

          {/* Policy sections */}
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#243653]">
                  Policy Sections
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Each section has its own heading and content.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={addSection}
                className="border-[#B7792B]/40 text-[#243653] hover:bg-[#B7792B]/5"
              >
                <Plus size={16} className="mr-2" />
                Add Section
              </Button>
            </div>

            {form.sections.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <FileText className="mx-auto h-10 w-10 text-slate-300" />

                <h3 className="mt-3 font-semibold text-[#243653]">
                  No sections yet
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Add your first section to start building your policy.
                </p>

                <Button
                  variant="outline"
                  onClick={addSection}
                  className="mt-4"
                >
                  <Plus size={16} className="mr-2" />
                  Add First Section
                </Button>
              </div>
            )}

            {form.sections.map((section, index) => (
              <div
                key={section.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#243653]/5 text-sm font-semibold text-[#243653]">
                      {index + 1}
                    </span>

                    <h3 className="font-semibold text-[#243653]">
                      Section {index + 1}
                    </h3>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSection(section.id)}
                    aria-label={`Delete section ${index + 1}`}
                    className="text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={17} />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`section-heading-${section.id}`}>
                      Section Heading
                    </Label>

                    <Input
                      id={`section-heading-${section.id}`}
                      value={section.heading}
                      onChange={(event) =>
                        updateSection(
                          section.id,
                          "heading",
                          event.target.value,
                        )
                      }
                      placeholder="e.g. Information We Collect"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`section-content-${section.id}`}>
                      Section Content
                    </Label>

                    <Textarea
                      id={`section-content-${section.id}`}
                      value={section.content}
                      onChange={(event) =>
                        updateSection(
                          section.id,
                          "content",
                          event.target.value,
                        )
                      }
                      placeholder="Write the details of this section..."
                      rows={6}
                    />

                    <p className="text-xs text-slate-400">
                      Separate paragraphs by pressing Enter.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom save actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {form.sections.length}{" "}
              {form.sections.length === 1 ? "section" : "sections"}
            </p>

            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-[#243653] hover:bg-[#1b2940]"
            >
              {saveMutation.isPending ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
