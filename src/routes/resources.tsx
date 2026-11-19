
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileText } from "lucide-react";
import { PageHeader, pageHead } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/resources")({
  head: () =>
    pageHead(
      "Knowledge Center | Tax, VAT & Company Registration Guides | Corporate Tax Bangladesh",
      "Educational resources on income tax, VAT, TIN, and tax documentation in Bangladesh.",
      "/resources",
    ),
  component: Resources,
});

type ResourceCategory = {
  id: string;
  name: string;
  display_order: number;
};

type Resource = {
  id: string;
  title: string;
  description: string;
  category_id: string | null;
  external_url: string | null;
  file_url: string | null;
  file_name: string | null;
  last_verified_at: string | null;
  published_at: string | null;
  display_order: number;
};

type ResourcePageSettings = {
  source_title: string;
  source_description: string;
  source_link_label: string;
  source_url: string;
};

function Resources() {
  const categoriesQuery = useQuery({
    queryKey: ["public-resource-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resource_categories")
        .select("id, name, display_order")
        .eq("enabled", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as ResourceCategory[];
    },
  });

  const resourcesQuery = useQuery({
    queryKey: ["public-resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select(
          "id, title, description, category_id, external_url, file_url, file_name, last_verified_at, published_at, display_order",
        )
        .eq("enabled", true)
        .not("published_at", "is", null)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Resource[];
    },
  });

  const settingsQuery = useQuery({
    queryKey: ["public-resource-page-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resource_page_settings")
        .select(
          "source_title, source_description, source_link_label, source_url",
        )
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;
      return data as ResourcePageSettings | null;
    },
  });

  const categories = categoriesQuery.data ?? [];
  const resources = resourcesQuery.data ?? [];
  const settings = settingsQuery.data;

  const isLoading =
    categoriesQuery.isLoading ||
    resourcesQuery.isLoading ||
    settingsQuery.isLoading;

  const hasError =
    categoriesQuery.isError ||
    resourcesQuery.isError ||
    settingsQuery.isError;

  const formatDate = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <>
      <PageHeader eyebrow="Tax Resources" title="Tax Knowledge Center">
        Educational guides on tax, VAT, registration and compliance.
      </PageHeader>

      <div className="container-page py-14">
        {isLoading ? (
          <div className="rounded-md border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Loading resources...
            </p>
          </div>
        ) : hasError ? (
          <div className="rounded-md border border-destructive/30 bg-card p-8">
            <p className="font-medium text-destructive">
              Unable to load resources.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please refresh the page or try again later.
            </p>
          </div>
        ) : (
          <>
            {categories.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold">Categories</h2>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <li
                      key={category.id}
                      className="rounded-sm border bg-card px-3 py-1.5 text-sm"
                    >
                      {category.name}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-10">
              {resources.length > 0 ? (
                <div className="space-y-10">
                  {categories.map((category) => {
                    const categoryResources = resources.filter(
                      (resource) => resource.category_id === category.id,
                    );

                    if (categoryResources.length === 0) return null;

                    return (
                      <div key={category.id}>
                        <h2 className="text-xl font-semibold">
                          {category.name}
                        </h2>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          {categoryResources.map((resource) => (
                            <article
                              key={resource.id}
                              className="rounded-md border bg-card p-6"
                            >
                              <div className="flex items-start gap-3">
                                <div className="rounded-sm bg-surface p-2">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold">
                                    {resource.title}
                                  </h3>

                                  {resource.description && (
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                      {resource.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {resource.last_verified_at && (
                                <p className="mt-4 text-xs text-muted-foreground">
                                  Last verified:{" "}
                                  {formatDate(resource.last_verified_at)}
                                </p>
                              )}

                              <div className="mt-5 flex flex-wrap gap-4">
                                {resource.external_url && (
                                  <a
                                    href={resource.external_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                                  >
                                    Visit resource
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}

                                {resource.file_url && (
                                  <a
                                    href={resource.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                                  >
                                    {resource.file_name || "View document"}
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-md border border-dashed bg-card p-8">
                  <p className="font-medium text-primary">
                    No resources are currently available.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Please check back later for published tax guides and
                    reference materials.
                  </p>
                </div>
              )}
            </section>
          </>
        )}

        {settings?.source_url && (
          <section className="mt-10 rounded-md bg-surface p-6">
            <h2 className="text-lg font-semibold">
              {settings.source_title}
            </h2>

            {settings.source_description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {settings.source_description}
              </p>
            )}

            <a
              href={settings.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {settings.source_link_label}
              <ExternalLink className="h-4 w-4" />
            </a>
          </section>
        )}
      </div>
    </>
  );
}
