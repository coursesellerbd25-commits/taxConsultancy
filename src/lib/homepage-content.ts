
export type HeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  primary_button: string;
  secondary_button: string;
  serving_label: string;
  serving_text: string;
};

export type Statistic = {
  id: "experience" | "clients" | "filings" | "areas";
  label: string;
  value: number | null;
};

export type AboutValue = {
  id: string;
  title: string;
  text: string;
};

export type AboutContent = {
  eyebrow: string;
  title: string;
  description: string;
  mission_label: string;
  mission: string;
  vision_label: string;
  vision: string;
  credentials: string[];
  button_text: string;
  values: AboutValue[];
};

export type ProcessStep = {
  title: string;
  text: string;
};

export type RegistrationContent = {
  eyebrow: string;
  title: string;
  link_text: string;
  steps: ProcessStep[];
  disclaimer: string;
};

export type HowItWorksContent = {
  eyebrow: string;
  title: string;
  steps: ProcessStep[];
  disclaimer: string;
};

export type Testimonial = {
  quote: string;
  client_name: string;
  service: string;
};

export type TestimonialsContent = {
  eyebrow: string;
  title: string;
  items: Testimonial[];
};

export type HomepageContent = {
  hero: HeroContent;
  statistics: Statistic[];
  about: AboutContent;
  registration: RegistrationContent;
  how_it_works: HowItWorksContent;
  testimonials: TestimonialsContent;
};

export const defaultHomepageContent: HomepageContent = {
  hero: {
    eyebrow: "Tax · VAT · Corporate Compliance",
    title:
      "Your Trusted Partner for Tax, VAT & Corporate Compliance in Bangladesh",
    description:
      "Navigate taxation, VAT, business registration, accounting, and regulatory compliance with professional guidance tailored to your needs.",
    primary_button: "Book a Consultation",
    secondary_button: "Explore Our Services",
    serving_label: "Serving",
    serving_text: "Individuals · Businesses · Investors",
  },

  statistics: [
    { id: "experience", label: "Years of Professional Experience", value: null },
    { id: "clients", label: "Clients Served", value: null },
    { id: "filings", label: "Tax Returns & Compliance Filings", value: null },
    { id: "areas", label: "Professional Service Areas", value: null },
  ],

  about: {
    eyebrow: "About Corporate Tax Bangladesh",
    title: "Professional guidance, communicated clearly",
    description:
      "Corporate Tax Bangladesh helps individuals, businesses and foreign investors understand and meet their tax, VAT and corporate compliance obligations in Bangladesh — with practical, transparent and confidential support.",
    mission_label: "Mission:",
    mission: "Make compliance understandable and manageable.",
    vision_label: "Vision:",
    vision:
      "A trusted, accessible compliance partner for every client we serve.",
    credentials: ["Verified qualifications and experience"],
    button_text: "Learn More About Us",
    values: [
      {
        id: "transparency",
        title: "Transparency",
        text: "Scope and fees are discussed clearly before work begins.",
      },
      {
        id: "client-focused",
        title: "Client-focused",
        text: "Every engagement starts by understanding your situation.",
      },
      {
        id: "confidentiality",
        title: "Confidentiality",
        text: "Your information is used only to serve your request.",
      },
      {
        id: "professional-responsibility",
        title: "Professional responsibility",
        text: "General guidance only within verified professional scope.",
      },
    ],
  },

  registration: {
    eyebrow: "Company registration",
    title: "Your company registration journey",
    link_text: "See the full process",
    steps: [
      {
        title: "Initial consultation",
        text: "Understand the proposed business structure and requirements.",
      },
      {
        title: "Company name search",
        text: "Check proposed name availability and relevant requirements.",
      },
      {
        title: "Document preparation",
        text: "Prepare the required company information and incorporation documents.",
      },
      {
        title: "Application and submission",
        text: "Assist with the relevant RJSC submission process.",
      },
      {
        title: "Registration and documentation",
        text: "Assist with obtaining the relevant incorporation documents.",
      },
      {
        title: "Post-registration compliance",
        text: "Explain TIN, trade license, BIN, bank account and other requirements.",
      },
    ],
    disclaimer:
      "Registration and approval timelines depend on the relevant authorities and are not guaranteed.",
  },

  how_it_works: {
    eyebrow: "How it works",
    title: "A clear path from enquiry to completion",
    steps: [
      { title: "Choose your service", text: "" },
      { title: "Submit an enquiry", text: "" },
      { title: "Receive initial consultation", text: "" },
      { title: "Discuss requirements and fees", text: "" },
      { title: "Submit required documents", text: "" },
      { title: "Receive professional assistance", text: "" },
      { title: "Track progress and updates", text: "" },
    ],
    disclaimer:
      "Submitting an enquiry does not create a professional-client relationship. Engagement and fees are agreed before any work begins.",
  },

  testimonials: {
    eyebrow: "Client feedback",
    title: "What clients say",
    items: [
      { quote: "", client_name: "", service: "" },
      { quote: "", client_name: "", service: "" },
      { quote: "", client_name: "", service: "" },
    ],
  },
};

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeHomepageContent(raw: unknown): HomepageContent {
  const data = isObject(raw) ? raw : {};
  const defaults = defaultHomepageContent;

  const rawAbout = isObject(data.about) ? data.about : {};
  const rawRegistration = isObject(data.registration)
    ? data.registration
    : {};
  const rawHow = isObject(data.how_it_works) ? data.how_it_works : {};
  const rawTestimonials = isObject(data.testimonials)
    ? data.testimonials
    : {};

  return {
    hero: {
      ...defaults.hero,
      ...(isObject(data.hero) ? data.hero : {}),
    },

    statistics: defaults.statistics.map((item, index) => {
      const saved = Array.isArray(data.statistics)
        ? data.statistics[index]
        : null;

      return {
        ...item,
        ...(isObject(saved) ? saved : {}),
        id: item.id,
      };
    }),

    about: {
      ...defaults.about,
      ...rawAbout,
      credentials: Array.isArray(rawAbout.credentials)
        ? rawAbout.credentials
        : defaults.about.credentials,
      values: defaults.about.values.map((item, index) => {
        const saved = Array.isArray(rawAbout.values)
          ? rawAbout.values[index]
          : null;

        return {
          ...item,
          ...(isObject(saved) ? saved : {}),
          id: item.id,
        };
      }),
    },

    registration: {
      ...defaults.registration,
      ...rawRegistration,
      steps: defaults.registration.steps.map((item, index) => {
        const saved = Array.isArray(rawRegistration.steps)
          ? rawRegistration.steps[index]
          : null;

        return {
          ...item,
          ...(isObject(saved) ? saved : {}),
        };
      }),
    },

    how_it_works: {
      ...defaults.how_it_works,
      ...rawHow,
      steps: defaults.how_it_works.steps.map((item, index) => {
        const saved = Array.isArray(rawHow.steps)
          ? rawHow.steps[index]
          : null;

        return {
          ...item,
          ...(isObject(saved) ? saved : {}),
        };
      }),
    },

    testimonials: {
      ...defaults.testimonials,
      ...rawTestimonials,
      items: defaults.testimonials.items.map((item, index) => {
        const saved = Array.isArray(rawTestimonials.items)
          ? rawTestimonials.items[index]
          : null;

        return {
          ...item,
          ...(isObject(saved) ? saved : {}),
        };
      }),
    },
  };
}
