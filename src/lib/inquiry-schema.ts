import { z } from "zod";
import { allServices, courses, COURSE_PREFIX } from "@/content/catalog";

const base = {
  fullName: z.string().trim().min(1, "Enter your full name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(255).transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(30).regex(/^\+?[0-9 ()-]+$/, "Use digits and an optional country code.").refine((value) => { const digits = value.replace(/\D/g, ""); return digits.length >= 7 && digits.length <= 15; }, "Enter a valid phone number."),
  country: z.string().trim().min(2, "Enter your country.").max(80).default("Bangladesh"),
  contactMethod: z.enum(["email", "phone", "whatsapp"]),
  clientCategory: z.enum(["individual", "business", "other"]),
  preferredTime: z.string().trim().max(100).default(""),
  preferredDate: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Choose a valid date.").default(""),
  message: z.string().trim().min(10, "Please describe your request in at least 10 characters.").max(1500, "Keep your description within 1,500 characters."),
  language: z.enum(["bangla", "english"]).default("english"),
  consent: z.boolean().refine((value) => value, "Please agree to be contacted about this inquiry."),
  website: z.string().max(0, "Unable to submit this request."),
};

const slug = z.string().min(1, "Choose a service.").max(100).regex(/^[a-z0-9-]+$/, "Choose an available service.");

/** Every service and course a visitor may ask about. */
export const knownSlugs = [...allServices.map((s) => s.slug), ...courses.map((c) => COURSE_PREFIX + c.slug)];

/** Format-only schema; the server additionally checks the service is known and not hidden. */
export const inquirySchema = z.object({ ...base, serviceSlug: slug });

export const makeInquirySchema = (allowed: string[]) =>
  z.object({ ...base, serviceSlug: slug.refine((v) => allowed.includes(v), "Choose an available service.") });

export type InquiryInput = z.input<typeof inquirySchema>;
export const inquirySubmissionSchema = inquirySchema.extend({ id: z.string().uuid() });
