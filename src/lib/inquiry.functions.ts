import { createServerFn } from "@tanstack/react-start";
import { inquirySubmissionSchema, knownSlugs } from "./inquiry-schema";

export const submitInquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inquirySubmissionSchema.parse(input))
  .handler(async ({ data }) => {
    // Public insert-only endpoint: validation happens before privileged access.
    // Never accepts status, notes, timestamps, or exposes existing inquiry data.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { consent, website, ...payload } = data;
    if (!knownSlugs.includes(payload.serviceSlug)) return { success: false as const, message: "Please choose an available service." };
    // Services the owner has hidden in the admin area cannot be requested.
    const { data: row } = await supabaseAdmin.from("services").select("enabled").eq("slug", payload.serviceSlug).maybeSingle();
    if (row && !row.enabled) return { success: false as const, message: "Please choose an available service." };
    const { error } = await supabaseAdmin.rpc("submit_inquiry", { payload });
    if (error) {
      return { success: false as const, message: error.message.includes("INQUIRY_RATE_LIMIT")
        ? "You have sent several requests recently. Please try again in an hour."
        : "Your request could not be saved. Please try again. Your details are still here." };
    }
    return { success: true as const };
  });
