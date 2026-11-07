export type FaqGroup = { category: string; items: { q: string; a: string }[] };

const VERIFY = "Requirements can change with each Finance Act and NBR notice, so verify the rules for the current income year.";

export const faqGroups: FaqGroup[] = [
  { category: "Individual Tax", items: [
    { q: "Who needs to submit an income tax return?", a: `Generally, individuals whose income exceeds the tax-free threshold, and individuals who meet certain conditions set by law (for example holding specific licences or assets), must file. ${VERIFY}` },
    { q: "What documents are required?", a: "Typically your TIN, salary or income statements, bank interest certificates, investment records and any tax already deducted at source. The exact list depends on your income sources." },
    { q: "How can I obtain a TIN?", a: "An e-TIN is registered online through the official NBR e-TIN system using your identification details. We can explain the steps." },
    { q: "How can I get assistance with a tax notice?", a: "Request a consultation and mention the notice. Do not upload the notice through the public form; you will be told how to share it securely." },
  ] },
  { category: "Corporate Tax", items: [
    { q: "What is corporate income tax?", a: `Tax charged on the taxable profits of companies and certain other entities. Rates differ by company type. ${VERIFY}` },
    { q: "What documents are needed for company tax returns?", a: "Usually audited financial statements, the company TIN, records of tax deducted at source, and supporting schedules." },
    { q: "What is tax compliance?", a: "Meeting all tax obligations on time: registration, deduction at source, advance tax, return filing and record-keeping." },
    { q: "How can a business organize its tax records?", a: "Keep invoices, bank statements, payroll and withholding records in a consistent, dated system and reconcile them regularly." },
  ] },
  { category: "VAT", items: [
    { q: "What is VAT?", a: "Value Added Tax is a consumption tax charged on the supply of goods and services at each stage of the supply chain." },
    { q: "What is BIN?", a: "The Business Identification Number issued on VAT registration or turnover tax enlistment." },
    { q: "Who needs VAT registration?", a: `Businesses above the registration threshold and certain activities regardless of turnover. ${VERIFY}` },
    { q: "How does monthly VAT return submission work?", a: "Registered businesses submit a return for each tax period through the official online VAT system, reporting output tax, input tax credit and payment." },
  ] },
  { category: "Business Registration", items: [
    { q: "How do I register a company in Bangladesh?", a: "Typically: name clearance, preparing the Memorandum and Articles, online submission to RJSC, fee payment, and receiving the certificate of incorporation." },
    { q: "What is RJSC?", a: "The Registrar of Joint Stock Companies and Firms, the authority that registers companies, partnerships and societies." },
    { q: "What is the difference between a trade license and company incorporation?", a: "Incorporation creates the company as a legal entity; a trade license from the local authority permits carrying on business in an area." },
    { q: "What is a memorandum of association?", a: "A founding document stating the company's name, objectives, capital and liability of members." },
  ] },
  { category: "Foreign Investors", items: [
    { q: "Can foreign investors establish a company in Bangladesh?", a: "Yes, in most sectors. Some sectors have restrictions or require additional permissions. Verify current policy." },
    { q: "What is FDI?", a: "Foreign Direct Investment: investment by a foreign person or company in a business in Bangladesh." },
    { q: "What is BIDA?", a: "The Bangladesh Investment Development Authority, which handles investment registrations, work permits and related services." },
    { q: "What are the general requirements for foreign company formation?", a: "Investor documents, director details, a local registered address, capital inflow through banking channels, and RJSC/BIDA processes as applicable." },
  ] },
  { category: "Training", items: [
    { q: "Who can join?", a: "Students, accountants, finance staff, business owners and anyone interested in tax and accounting." },
    { q: "What courses are available?", a: "See the Training & Courses page. Schedules are published once confirmed." },
    { q: "Are classes online or offline?", a: "The format is confirmed for each batch. Contact us for details." },
    { q: "Is a certificate provided?", a: "Certificate details are shown on each course page only once confirmed." },
  ] },
];
