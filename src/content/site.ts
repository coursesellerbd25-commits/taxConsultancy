/**
 * Editable site content. Every value marked `null` or containing "[Placeholder" is
 * unconfirmed and must be supplied by the owner before launch. Missing contact
 * details are hidden automatically — nothing is invented.
 * (Phase 3 moves these values into the admin dashboard.)
 */
export const site = {
  businessName: "Corporate Tax Bangladesh",
  tagline: "Tax & VAT Consultancy · Bangladesh",
  consultantName: null as string | null,
  contactEmail: null as string | null,
  contactPhone: null as string | null,
  whatsappNumber: null as string | null, // international format, digits only, e.g. 8801XXXXXXXXX
  whatsappMessage: "Hello, I would like to ask about a tax consultation.",
  officeAddress: null as string | null,
  businessHours: null as string | null,
  socialLinks: [] as { label: string; url: string }[],
  credentials: [] as string[], // verified qualifications only
  affiliations: [] as string[], // verified memberships only
  biography: null as string | null,
};

export type Service = {
  slug: string;
  title: string;
  short: string;
  description: string;
  whoNeeds: string[];
  helpWith: string[];
  documents: string[];
  enabled: boolean;
};

export const services: Service[] = [
  {
    slug: "individual-income-tax",
    title: "Individual Income Tax Assistance",
    short: "Guidance on understanding your personal income tax obligations and organizing records.",
    description:
      "General guidance for salaried individuals, professionals, and others who want help understanding their personal income tax responsibilities.",
    whoNeeds: ["Salaried employees", "Self-employed professionals", "Individuals with multiple income sources"],
    helpWith: ["Understanding which income sources may be relevant", "Organizing income and investment records", "Explaining general filing steps"],
    documents: ["Salary or income statements", "Records of investments or savings, if any", "Previous tax records, if available"],
    enabled: true,
  },
  {
    slug: "business-tax-compliance",
    title: "Business Tax Compliance",
    short: "Support for businesses in understanding and organizing their tax compliance responsibilities.",
    description:
      "Consultation for sole proprietors, partnerships, and companies seeking clarity on business tax compliance and record-keeping.",
    whoNeeds: ["Sole proprietors", "Partnerships", "Small and medium companies"],
    helpWith: ["Reviewing record-keeping practices", "Explaining general compliance obligations", "Preparing for discussions with your accountant"],
    documents: ["Business registration documents", "Financial statements or ledgers", "Previous tax correspondence, if any"],
    enabled: true,
  },
  {
    slug: "vat-consultancy",
    title: "VAT Consultancy",
    short: "Practical guidance on VAT matters, registration questions, and ongoing compliance.",
    description:
      "Consultation on VAT-related questions for businesses, including registration questions, record-keeping, and periodic compliance.",
    whoNeeds: ["Businesses with VAT-related questions", "New businesses unsure about VAT obligations"],
    helpWith: ["Explaining general VAT concepts", "Reviewing VAT record organization", "Clarifying questions before filing"],
    documents: ["Business registration details", "Sales and purchase records", "Existing VAT documentation, if any"],
    enabled: true,
  },
  {
    slug: "tax-return-preparation",
    title: "Tax Return Preparation Assistance",
    short: "Help organizing documents and information needed for your tax return.",
    description:
      "Assistance with gathering and organizing the information typically needed when preparing a tax return.",
    whoNeeds: ["First-time filers", "Individuals who want organized documentation"],
    helpWith: ["Preparing a document checklist", "Organizing income and expense information", "Reviewing completeness before submission"],
    documents: ["Income records", "Supporting documents for any claimed items", "Previous return, if available"],
    enabled: true,
  },
  {
    slug: "tin-guidance",
    title: "TIN-Related Guidance",
    short: "General guidance on Taxpayer Identification Number questions.",
    description:
      "General information about TIN-related questions. Registration itself is completed through official NBR channels.",
    whoNeeds: ["Individuals or businesses with TIN questions"],
    helpWith: ["Explaining the general TIN process", "Pointing to official NBR resources"],
    documents: ["Identification details as required by official channels"],
    enabled: true,
  },
  {
    slug: "tax-notice-assistance",
    title: "Tax Notice and Documentation Assistance",
    short: "Help understanding tax notices and organizing the documents they ask for.",
    description:
      "Support in reading and understanding tax-related notices and organizing documentation in response.",
    whoNeeds: ["Anyone who has received a tax-related notice"],
    helpWith: ["Explaining what a notice is asking for", "Organizing requested documents", "Planning next steps"],
    documents: ["A copy of the notice", "Related tax records"],
    enabled: true,
  },
  {
    slug: "compliance-review",
    title: "Tax Compliance Reviews",
    short: "A structured review of your records to identify gaps and questions.",
    description:
      "A review of your existing records and practices to help identify gaps and questions worth addressing.",
    whoNeeds: ["Individuals and businesses wanting a check of their records"],
    helpWith: ["Reviewing record completeness", "Highlighting areas for clarification"],
    documents: ["Recent tax records", "Supporting financial records"],
    enabled: true,
  },
  {
    slug: "general-consultation",
    title: "General Tax Consultation",
    short: "A conversation about your tax questions to understand your situation.",
    description: "A general consultation to discuss your questions and decide what kind of help, if any, you need.",
    whoNeeds: ["Anyone with general tax questions"],
    helpWith: ["Understanding your questions", "Suggesting possible next steps"],
    documents: ["Any documents relevant to your question"],
    enabled: true,
  },
];

export const enabledServices = () => services.filter((s) => s.enabled);

export type Faq = { q: string; a: string; category: string };

export const faqs: Faq[] = [
  { category: "Consultation booking", q: "How do I request a consultation?", a: "Use the consultation request form and describe briefly what you need help with. You will be contacted to discuss next steps." },
  { category: "Consultation booking", q: "Does submitting a request mean my service is confirmed?", a: "No. A request does not create a professional-client relationship or guarantee that a service will be provided. Engagement is confirmed separately." },
  { category: "What to prepare", q: "What documents should I prepare?", a: "This depends on your situation. After your request is reviewed, you may receive a document checklist. Please do not send sensitive documents through the public form." },
  { category: "Individual and business tax", q: "Do you help both individuals and businesses?", a: "The service categories cover both. Contact us for details about your specific situation." },
  { category: "VAT", q: "Can you help with VAT questions?", a: "VAT consultancy is one of the listed service categories. Contact us for details." },
  { category: "Fees", q: "How much does a consultation cost?", a: "Contact us for details." },
  { category: "Confidentiality", q: "Is my information kept confidential?", a: "Inquiry information is used only to respond to your request. See the Privacy Policy for details." },
  { category: "Response times", q: "How soon will I hear back?", a: "Contact us for details." },
  { category: "Government filing", q: "Can you file with the government on my behalf?", a: "Contact us for details. Official filings are made through official NBR channels." },
];

export const NBR_URL = "https://nbr.gov.bd";
