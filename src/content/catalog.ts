/**
 * Full service catalogue (8 categories). Content is general and educational.
 * Availability defaults to "contact" — the owner confirms which services are offered.
 */
export type Availability = "available" | "contact" | "soon";

export type CatalogService = { slug: string; title: string; short: string; availability: Availability };

export type Category = {
  slug: string;
  letter: string;
  title: string;
  icon: "receipt" | "percent" | "building" | "calculator" | "shield" | "globe" | "file" | "scale";
  summary: string;
  authority: string[];
  whoNeeds: string[];
  why: string;
  benefits: string[];
  documents: string[];
  process: string[];
  faqs: { q: string; a: string }[];
  note?: string;
  services: CatalogService[];
};

const s = (slug: string, title: string, short: string, availability: Availability = "contact"): CatalogService => ({ slug, title, short, availability });

export const categories: Category[] = [
  {
    slug: "taxation", letter: "A", title: "Taxation Services", icon: "receipt",
    summary: "Individual and corporate income tax guidance, return preparation support and help with tax notices.",
    authority: ["National Board of Revenue (NBR)", "Taxes Zone and Circle offices"],
    whoNeeds: ["Salaried individuals and professionals", "Business owners and companies", "Anyone who has received a tax notice"],
    why: "Income tax obligations depend on your income sources, the applicable income year and current legislation. Organized records and timely filing help reduce errors and avoid avoidable penalties.",
    benefits: ["Clear explanation of your obligations", "Organized documents before filing", "Fewer errors in your return", "Better preparation for questions from tax authorities"],
    documents: ["TIN certificate", "Income records (salary statements, business accounts)", "Investment and savings records, if any", "Previous returns and assessment orders, if available"],
    process: ["Initial discussion of your situation", "Document checklist shared", "Review of records and calculations", "Draft prepared for your review", "Filing support through official channels", "Follow-up on any queries"],
    faqs: [
      { q: "Do tax rates change every year?", a: "Rates, thresholds and deadlines can change through the annual Finance Act. Always confirm the rules for the applicable income year." },
      { q: "Can you file on my behalf?", a: "Filing is completed through official NBR channels. The scope of assistance is agreed during consultation." },
    ],
    services: [
      s("individual-income-tax", "Individual Income Tax Consultancy", "Understand your personal income tax obligations and organize your records.", "available"),
      s("tax-return-preparation", "Personal Income Tax Return Preparation", "Help organizing information and documents for your personal return.", "available"),
      s("corporate-income-tax", "Corporate Income Tax Consultancy", "Guidance on corporate income tax obligations for companies."),
      s("corporate-tax-return", "Corporate Tax Return Preparation", "Support preparing the information needed for company tax returns."),
      s("tax-planning", "Tax Planning and Advisory", "Lawful planning within current rules for individuals and businesses."),
      s("advance-tax", "Advance Tax Guidance", "Explanation of advance tax requirements and record-keeping."),
      s("investment-tax-rebate", "Investment Tax Rebate Guidance", "General guidance on eligible investments and rebate documentation."),
      s("salary-tax-calculation", "Salary Income Tax Calculation", "Help calculating tax on salary income for the applicable year."),
      s("tax-assessment", "Tax Assessment Assistance", "Support organizing records during the assessment process."),
      s("tax-notice-assistance", "Tax Notice and Documentation Assistance", "Understand what a notice asks for and organize your response.", "available"),
      s("compliance-review", "Tax Compliance Review", "A structured review of records to identify gaps and questions.", "available"),
      s("withholding-tax", "Withholding Tax Consultancy", "Guidance on deducting, depositing and reporting withholding tax."),
      s("business-tax-compliance", "Business Tax Compliance", "Support for businesses organizing their tax compliance.", "available"),
      s("tin-guidance", "TIN-Related Guidance", "General guidance on Taxpayer Identification Number questions.", "available"),
      s("general-consultation", "General Tax Consultation", "A conversation about your tax questions and possible next steps.", "available"),
    ],
  },
  {
    slug: "vat", letter: "B", title: "VAT Services", icon: "percent",
    summary: "VAT and BIN registration, monthly returns, documentation and compliance reviews.",
    authority: ["National Board of Revenue (NBR) — VAT wing", "VAT Commissionerates and Divisional offices"],
    whoNeeds: ["Businesses supplying goods or services", "Importers and exporters", "New businesses unsure about VAT obligations"],
    why: "VAT compliance involves registration, invoicing, monthly returns and record-keeping. Mistakes can lead to notices, interest or penalties.",
    benefits: ["Clarity on registration requirements", "Organized sales and purchase records", "Consistent monthly return preparation", "Better readiness for audits and notices"],
    documents: ["Trade license and business registration", "TIN certificate", "Bank account details of the business", "Sales and purchase records"],
    process: ["Review of business activity", "Registration or compliance checklist", "Records organized", "Returns or documents prepared", "Submission support through official systems", "Ongoing compliance follow-up"],
    faqs: [
      { q: "What is BIN?", a: "BIN is the Business Identification Number issued on VAT registration or enlistment." },
      { q: "When is the VAT return due?", a: "Return periods and due dates are set by current VAT law and NBR notices. Please verify the current deadline." },
    ],
    services: [
      s("vat-consultancy", "VAT Consultancy", "Practical guidance on VAT questions and ongoing compliance.", "available"),
      s("vat-registration", "VAT Registration", "Assistance with the VAT registration process."),
      s("bin-registration", "BIN Registration", "Support obtaining a Business Identification Number."),
      s("monthly-vat-return", "Monthly VAT Return Preparation", "Preparing monthly VAT return information from your records."),
      s("vat-return-submission", "VAT Return Submission Assistance", "Support submitting returns through the official system."),
      s("vat-compliance-review", "VAT Compliance Review", "Review of VAT records and practices to identify gaps."),
      s("vat-documentation", "VAT Documentation", "Organizing invoices, registers and supporting documents."),
      s("input-tax-credit", "Input Tax Credit Guidance", "General guidance on claiming input tax credit correctly."),
      s("withholding-vat", "Withholding VAT Guidance", "Explanation of VAT deduction at source obligations."),
      s("vat-audit", "VAT Audit Assistance", "Preparing records and explanations for a VAT audit."),
      s("vat-notice-response", "VAT Notice Response Assistance", "Understanding and responding to VAT notices."),
      s("vat-compliance-advisory", "VAT Compliance Advisory", "Ongoing advisory support for VAT compliance."),
    ],
  },
  {
    slug: "business-registration", letter: "C", title: "Business Startup & Registration", icon: "building",
    summary: "Company formation, trade license, TIN, BIN, IRC/ERC and startup documentation support.",
    authority: ["Registrar of Joint Stock Companies and Firms (RJSC)", "City Corporations / local authorities (trade license)", "NBR (TIN, BIN)", "Office of the Chief Controller of Imports and Exports (IRC/ERC)"],
    whoNeeds: ["Entrepreneurs and startups", "Existing businesses changing structure", "Businesses entering import or export"],
    why: "Choosing the right structure and completing registrations correctly gives your business a sound legal and tax foundation.",
    benefits: ["Guidance on the right business structure", "Organized incorporation documents", "Fewer delays from incomplete applications", "Clear post-registration checklist"],
    documents: ["Proposed business name(s)", "Owner/director identification details", "Proposed office address", "Share structure and business objectives"],
    process: ["Initial consultation", "Name search", "Document preparation", "Application and submission", "Registration documents", "Post-registration compliance"],
    faqs: [
      { q: "How long does registration take?", a: "Timelines depend on the relevant authority and the completeness of documents. No timeline is guaranteed." },
      { q: "Is a trade license the same as incorporation?", a: "No. Incorporation creates the company through RJSC; a trade license permits business activity in a local area." },
    ],
    services: [
      s("private-limited-company", "Private Limited Company Formation", "Assistance with forming a private limited company."),
      s("one-person-company", "One Person Company Formation", "Support registering a one person company."),
      s("partnership-registration", "Partnership Registration", "Help registering a partnership firm."),
      s("society-registration", "Society Registration", "Assistance with society registration requirements."),
      s("trade-license", "Trade License Assistance", "Support obtaining or renewing a trade license."),
      s("company-tin", "Company TIN Registration", "Help obtaining a TIN for your company."),
      s("company-bin", "BIN Registration for New Businesses", "Assistance with BIN after incorporation."),
      s("rjsc-registration", "RJSC Registration Assistance", "Support with RJSC registration steps."),
      s("name-clearance", "Company Name Clearance Assistance", "Help checking and reserving a company name."),
      s("moa-aoa", "Memorandum and Articles Preparation Assistance", "Drafting support for MoA and AoA."),
      s("irc", "Import Registration Certificate (IRC)", "Assistance with IRC applications."),
      s("erc", "Export Registration Certificate (ERC)", "Assistance with ERC applications."),
      s("startup-consultancy", "Startup Business Consultancy", "Guidance for founders setting up a new business."),
      s("business-documentation", "Business Documentation", "Organizing core business documents and records."),
    ],
  },
  {
    slug: "accounting", letter: "D", title: "Accounting & Auditing", icon: "calculator",
    summary: "Bookkeeping, financial statements, payroll reporting and audit preparation.",
    authority: ["Financial Reporting Council (FRC) standards", "NBR (for tax-related reporting)"],
    whoNeeds: ["Small businesses without in-house accountants", "Companies preparing for audit", "Businesses adopting accounting software"],
    why: "Accurate books support tax filing, VAT compliance, financing decisions and audits.",
    benefits: ["Reliable, up-to-date records", "Statements ready for tax and audit", "Better financial visibility", "Less year-end pressure"],
    documents: ["Bank statements", "Sales and purchase invoices", "Expense receipts", "Payroll records"],
    process: ["Review of current records", "Agree scope and frequency", "Set up or clean up books", "Periodic processing", "Reports prepared", "Year-end and audit support"],
    faqs: [{ q: "Do you provide statutory audits?", a: "Statutory audits must be performed by qualified audit firms. Assistance here covers preparation and support." }],
    note: "Statutory audit opinions are issued only by licensed audit firms. Services here cover preparation and support.",
    services: [
      s("bookkeeping", "Bookkeeping Services", "Regular recording of business transactions."),
      s("financial-statements", "Financial Statement Preparation", "Preparing financial statements from your books."),
      s("accounting-consultancy", "Accounting Consultancy", "Advice on accounting practices and controls."),
      s("internal-audit", "Internal Audit Assistance", "Support reviewing internal processes and controls."),
      s("record-management", "Financial Record Management", "Organizing and maintaining financial records."),
      s("small-business-accounting", "Small Business Accounting", "Accounting support sized for small businesses."),
      s("corporate-accounting", "Corporate Accounting", "Accounting support for companies."),
      s("accounting-software", "Accounting Software Consultancy", "Help choosing and setting up accounting software."),
      s("payroll-reporting", "Payroll and Financial Reporting", "Payroll processing support and reporting."),
      s("audit-preparation", "Audit Preparation Assistance", "Preparing schedules and records for auditors."),
    ],
  },
  {
    slug: "intellectual-property", letter: "E", title: "Intellectual Property Rights", icon: "shield",
    summary: "Documentation and guidance for trademarks, copyright, patents and industrial designs.",
    authority: ["Department of Patents, Designs and Trademarks (DPDT)", "Copyright Office Bangladesh"],
    whoNeeds: ["Businesses building a brand", "Creators and publishers", "Inventors and product designers"],
    why: "Registering intellectual property helps establish ownership and supports enforcement against misuse.",
    benefits: ["Understanding of what can be protected", "Organized application documents", "Clear view of the official process"],
    documents: ["Brand name, logo or work samples", "Applicant details", "Description of goods/services or the work"],
    process: ["Initial consultation", "Search and assessment guidance", "Application documents prepared", "Filing support", "Follow-up on official queries"],
    faqs: [{ q: "Is this legal representation?", a: "No. This covers consultancy and documentation support. Representation before authorities or courts requires a qualified legal practitioner." }],
    note: "Consultancy and documentation support only. Corporate Tax Bangladesh is not a law firm and does not provide legal representation.",
    services: [
      s("trademark", "Trademark Registration Assistance", "Documentation support for trademark applications."),
      s("copyright", "Copyright Registration Guidance", "Guidance on copyright registration."),
      s("patent", "Patent Registration Guidance", "General guidance on the patent process."),
      s("industrial-design", "Industrial Design Registration", "Documentation support for design registration."),
      s("brand-protection", "Brand Protection Consultancy", "Advice on protecting your brand."),
      s("ip-enforcement", "IP Rights Enforcement Assistance", "Documentation support around enforcement matters."),
    ],
  },
  {
    slug: "foreign-investment", letter: "F", title: "Foreign Investment & Business Setup", icon: "globe",
    summary: "Guidance for foreign investors on company formation, BIDA processes, work permits and compliance.",
    authority: ["Bangladesh Investment Development Authority (BIDA)", "RJSC", "Bangladesh Bank (foreign exchange reporting)", "NBR"],
    whoNeeds: ["Foreign investors entering Bangladesh", "Foreign companies opening a branch or liaison office", "Companies employing foreign nationals"],
    why: "Foreign investment involves several authorities and reporting requirements. Coordinated preparation reduces delays.",
    benefits: ["Clear overview of the setup journey", "Coordinated document preparation", "Awareness of reporting obligations"],
    documents: ["Investor and parent company documents", "Passport copies of directors", "Proposed investment details", "Board resolutions where applicable"],
    process: ["Initial consultation", "Structure and approval mapping", "Document preparation", "Applications to relevant authorities", "Registration and permits", "Ongoing compliance"],
    faqs: [{ q: "Can foreigners own 100% of a company?", a: "Many sectors permit foreign ownership, but rules vary by sector. Verify current BIDA and sector-specific policy." }],
    note: "Visa and immigration matters are guidance and documentation support only.",
    services: [
      s("foreign-company-formation", "Foreign Company Formation", "Assistance forming a company with foreign shareholding."),
      s("fdi-consultancy", "FDI Consultancy", "Guidance on foreign direct investment requirements."),
      s("bida-registration", "BIDA Registration and Permission Assistance", "Support with BIDA registrations and permissions."),
      s("foreign-investor-setup", "Foreign Investor Business Setup", "End-to-end setup guidance for investors."),
      s("work-permit", "Work Permit and Visa Assistance", "Documentation support for work permits and visas."),
      s("foreign-director", "Foreign Director-Related Assistance", "Support with foreign director requirements."),
      s("registered-office", "Registered Office Address Assistance", "Guidance on registered office requirements."),
      s("foreign-equity-reporting", "Foreign Equity Reporting Guidance", "Guidance on reporting foreign equity inflows."),
      s("winding-up", "Company Winding Up Assistance", "Support with the closure process for companies."),
    ],
  },
  {
    slug: "regulatory-licenses", letter: "G", title: "Regulatory Licenses & Corporate Affairs", icon: "file",
    summary: "Licenses, permissions, company secretarial work and RJSC filings.",
    authority: ["DIFE", "Fire Service and Civil Defence", "Department of Environment", "BSTI", "Export Promotion Bureau", "Customs", "RJSC"],
    whoNeeds: ["Factories and manufacturers", "Importers, exporters and buying houses", "Companies with changes in shares or directors"],
    why: "Licenses and corporate filings keep your business operating legally and your company records up to date.",
    benefits: ["Checklist of applicable licenses", "Timely renewals and filings", "Accurate corporate records"],
    documents: ["Company incorporation documents", "Trade license", "Premises documents", "Board resolutions for corporate changes"],
    process: ["Identify applicable requirements", "Prepare documents", "Submit applications or filings", "Follow up with authority", "Maintain records"],
    faqs: [{ q: "Which licenses does my business need?", a: "It depends on your activity, location and size. A consultation helps identify the relevant requirements." }],
    services: [
      s("factory-license", "Factory License Assistance (DIFE)", "Support with factory license applications."),
      s("fire-license", "Fire License Assistance", "Assistance with fire safety license applications."),
      s("environmental-clearance", "Environmental Clearance Assistance", "Support with environmental clearance."),
      s("customs-bond", "Customs Bond License", "Assistance with customs bond licensing."),
      s("bsti-permission", "BSTI Permission", "Support with BSTI certification and permission."),
      s("epb-registration", "EPB Registration Assistance", "Assistance with Export Promotion Bureau registration."),
      s("travel-agency-license", "Travel Agency License Assistance", "Support with travel agency licensing."),
      s("buying-house-license", "Buying House License Assistance", "Assistance with buying house licensing."),
      s("company-secretarial", "Company Secretarial Services", "Board minutes, registers and corporate records."),
      s("share-transfer", "Share Transfer", "Documentation and filing support for share transfers."),
      s("share-allotment", "Share Allotment", "Support with allotment of new shares."),
      s("share-transmission", "Share Transmission", "Assistance with transmission of shares."),
      s("address-change", "Registered Address Change", "Support updating the registered office address."),
      s("rjsc-return", "RJSC Return Filing", "Annual return and filing support with RJSC."),
      s("corporate-documentation", "Corporate Documentation", "Preparing and organizing corporate documents."),
      s("notary-translation", "Notary and Translation Assistance", "Coordinating notarization and translations."),
    ],
  },
  {
    slug: "legal-support", letter: "H", title: "Legal & Corporate Support", icon: "scale",
    summary: "Consultancy and documentation support on company law and business contracts.",
    authority: ["Companies Act and related regulations", "Courts and tribunals (through qualified lawyers)"],
    whoNeeds: ["Companies needing contract documentation", "Businesses facing corporate disputes", "Owners with company law questions"],
    why: "Clear documentation and early guidance help businesses manage legal risk.",
    benefits: ["Clarity on general legal requirements", "Organized documentation", "Referral pathway to qualified lawyers where needed"],
    documents: ["Relevant agreements or correspondence", "Company documents", "Summary of the issue"],
    process: ["Initial consultation", "Review of documents", "Guidance or documentation prepared", "Referral to a qualified lawyer where representation is required"],
    faqs: [{ q: "Do you represent clients in court?", a: "No. Litigation support here means documentation and coordination. Court representation requires a licensed advocate." }],
    note: "Consultancy and documentation support only. Corporate Tax Bangladesh is not a law firm; litigation representation is provided only by licensed advocates.",
    services: [
      s("corporate-legal", "Corporate Legal Consultancy", "General consultancy on corporate legal matters."),
      s("company-law", "Company Law Guidance", "Guidance on company law requirements."),
      s("civil-litigation-support", "Civil Litigation Support", "Documentation support for civil matters."),
      s("criminal-litigation-support", "Criminal Litigation Support", "Documentation support and coordination."),
      s("contract-documentation", "Business Contract Documentation", "Drafting support for business contracts."),
      s("corporate-dispute", "Corporate Dispute Assistance", "Documentation and guidance in corporate disputes."),
    ],
  },
];

export const allServices = categories.flatMap((c) => c.services.map((sv) => ({ ...sv, category: c })));
export const findCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const findService = (slug: string) => allServices.find((x) => x.slug === slug);
export const availabilityLabel: Record<Availability, string> = { available: "Available", contact: "Contact for availability", soon: "Coming soon" };
export const COURSE_PREFIX = "course-";

export type Course = { slug: string; title: string; overview: string; objectives: string[]; syllabus: string[]; audience: string };
export const courses: Course[] = [
  { slug: "professional-taxation", title: "Professional Taxation Training", audience: "Accountants, finance staff and students", overview: "A structured introduction to the Bangladesh income tax framework for practitioners.", objectives: ["Understand the structure of income tax law", "Classify income heads", "Prepare basic computations"], syllabus: ["Overview of the tax system", "Heads of income", "Computation of taxable income", "Returns and assessment", "Practical cases"] },
  { slug: "income-tax-return", title: "Income Tax Return Preparation", audience: "Individuals and junior practitioners", overview: "Hands-on practice preparing individual income tax returns.", objectives: ["Gather the right documents", "Complete return forms", "Avoid common mistakes"], syllabus: ["Documents and records", "Salary and other income", "Investment rebate", "Completing the return", "Submission"] },
  { slug: "vat-compliance", title: "VAT and Compliance Training", audience: "Business owners and accounts staff", overview: "Practical VAT compliance from registration to monthly returns.", objectives: ["Understand VAT registration", "Maintain VAT records", "Prepare monthly returns"], syllabus: ["VAT basics", "Registration and BIN", "Invoices and registers", "Input tax credit", "Monthly returns"] },
  { slug: "accounting", title: "Accounting Training", audience: "Beginners and small business owners", overview: "Foundations of bookkeeping and financial statements.", objectives: ["Record transactions", "Prepare trial balance", "Read financial statements"], syllabus: ["Accounting principles", "Journals and ledgers", "Trial balance", "Financial statements", "Software introduction"] },
  { slug: "corporate-compliance", title: "Corporate Compliance Training", audience: "Company secretaries and managers", overview: "An overview of ongoing compliance for companies.", objectives: ["Know key RJSC filings", "Maintain statutory registers", "Plan a compliance calendar"], syllabus: ["Company law overview", "Statutory registers", "Annual filings", "Share changes", "Compliance calendar"] },
  { slug: "business-startup", title: "Business Startup and Registration", audience: "Entrepreneurs", overview: "How to choose a structure and complete key registrations.", objectives: ["Compare business structures", "Understand registration steps", "Plan post-registration compliance"], syllabus: ["Business structures", "Name clearance and RJSC", "Trade license, TIN, BIN", "Bank account and records"] },
  { slug: "management", title: "Management and Business Courses", audience: "Managers and owners", overview: "Practical business management topics for growing organizations.", objectives: ["Plan and budget", "Use financial reports for decisions"], syllabus: ["Planning and budgeting", "Reading financial reports", "Internal controls"] },
  { slug: "tax-software", title: "Practical Tax Software and Online Return Training", audience: "Individuals and practitioners", overview: "Practical walkthrough of online tax and VAT systems.", objectives: ["Navigate online systems", "Submit returns online", "Keep digital records"], syllabus: ["Account setup", "Online return walkthrough", "Online VAT system", "Common errors"] },
];
export const findCourse = (slug: string) => courses.find((c) => c.slug === slug);
