import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { services as fallbackServices, site as fallbackSite, type Service } from "@/content/site";

export type SiteInfo = typeof fallbackSite;

/** Public business details and enabled services, edited by the owner in /admin. */
export const siteDataQuery = queryOptions({
  queryKey: ["site-data"],
  staleTime: 60_000,
  queryFn: async () => {
    const [settingsRes, servicesRes] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("services").select("*").eq("enabled", true).order("display_order"),
    ]);
    const s = settingsRes.data;
    const site: SiteInfo = s
      ? {
          ...fallbackSite,
          businessName: s.business_name || fallbackSite.businessName,
          tagline: s.tagline || fallbackSite.tagline,
          consultantName: s.consultant_name || null,
          biography: s.biography || null,
          contactEmail: s.contact_email || null,
          contactPhone: s.contact_phone || null,
          whatsappNumber: s.whatsapp_number || null,
          whatsappMessage: s.whatsapp_message || fallbackSite.whatsappMessage,
          officeAddress: s.office_address || null,
          businessHours: s.business_hours || null,
        }
      : fallbackSite;
    const services: Service[] = servicesRes.data
      ? servicesRes.data.map((r) => ({
          slug: r.slug, title: r.title, short: r.short_description, description: r.full_description,
          whoNeeds: r.who_needs, helpWith: r.help_with, documents: r.documents, enabled: r.enabled,
        }))
      : fallbackServices.filter((x) => x.enabled);
    return { site, services };
  },
});

export const useSite = () => useSuspenseQuery(siteDataQuery).data.site;
export const useServices = () => useSuspenseQuery(siteDataQuery).data.services;
