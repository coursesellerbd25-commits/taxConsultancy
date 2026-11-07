import { describe, expect, it } from "vitest";
import { inquirySchema, makeInquirySchema } from "@/lib/inquiry-schema";

const valid = {
  fullName: "Test Visitor", email: "visitor@example.com", phone: "+880 1712 345678",
  contactMethod: "email", clientCategory: "individual", serviceSlug: "general-consultation",
  preferredTime: "", message: "I need help organizing my tax records.", language: "bangla", consent: true, website: "",
};

describe("Inquiry validation", () => {
  it("accepts all requested fields with optional consultation time empty", () => {
    expect(inquirySchema.parse(valid).preferredTime).toBe("");
  });
  it("requires consent to contact the visitor", () => {
    expect(inquirySchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });
  it("rejects invalid email addresses", () => {
    expect(inquirySchema.safeParse({ ...valid, email: "invalid" }).success).toBe(false);
  });
  it("rejects invalid phone formats", () => {
    expect(inquirySchema.safeParse({ ...valid, phone: "not-a-number" }).success).toBe(false);
  });
  it("rejects unavailable services", () => {
    expect(makeInquirySchema(["general-consultation"]).safeParse({ ...valid, serviceSlug: "unavailable" }).success).toBe(false);
  });
  it("rejects filled spam fields", () => {
    expect(inquirySchema.safeParse({ ...valid, website: "spam" }).success).toBe(false);
  });
  it("does not accept visitor-provided internal notes or statuses", () => {
    expect(inquirySchema.parse({ ...valid, internal_notes: "hacked", status: "closed" })).not.toHaveProperty("internal_notes");
    expect(inquirySchema.parse({ ...valid, status: "closed" })).not.toHaveProperty("status");
  });
});
describe("Service catalogue enquiries", () => {
  it("accepts any catalogue service or course as an enquiry topic", async () => {
    const { knownSlugs } = await import("@/lib/inquiry-schema");
    expect(knownSlugs).toContain("vat-registration");
    expect(knownSlugs).toContain("course-vat-compliance");
    expect(knownSlugs).not.toContain("unknown-service");
  });
  it("defaults country to Bangladesh and allows an empty preferred date", () => {
    const parsed = inquirySchema.parse(valid);
    expect(parsed.country).toBe("Bangladesh");
    expect(parsed.preferredDate).toBe("");
  });
  it("rejects a malformed preferred date", () => {
    expect(inquirySchema.safeParse({ ...valid, preferredDate: "next week" }).success).toBe(false);
  });
});
