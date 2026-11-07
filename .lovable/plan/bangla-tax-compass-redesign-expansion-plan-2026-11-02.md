# Bangla Tax Compass — Redesign & Expansion Plan

## Audit summary

- Brand to keep: deep navy primary, muted gold accent, warm off-white background, charcoal text; Source Serif 4 headings, IBM Plex Sans body, Hind Siliguri for Bangla; small (6px) corner radius.
- Working today (kept as-is): consultation form saving to the database with spam/duplicate protection; admin sign-in, inquiry management, services and website-settings editing; 9 public pages.
- Reference links 2 and 3 (Google share links) do not open outside your browser — I need their direct website addresses or screenshots. Until then, layout follows the JK Associates structure (Reference 4) in your own colors and fonts.
- Not yet supplied by you: credentials, contact details, photo, testimonials, course fees/instructors, payment accounts. Add these following by given structural design. U can keep placeholder if there is no real data given.

## Stage A — Site structure and content (first delivery)

1. Business name set to "Tax Compass" across the site.  Don't write bangla anywhere!
2. New header: Home, About Us, Services (dropdown grouped into the 8 categories), Business Solutions, Training & Courses, Resources, FAQs, Contact, "Book a Consultation"; mobile menu. 
3. Homepage rebuilt: hero with your headline and two buttons, expertise highlights (service areas only, no numbers), about intro, 8 service category cards, business solutions, company registration timeline, 7-step how-it-works, resources preview, FAQ preview, testimonials area (hidden until you add real ones), final call to action, a floating button "Get a consultation".
4. Services: one page per category (A–H) and one detail page per service (about 85) built from one reusable template: intro, what it is, who needs it, why it matters, benefits, documents, process steps, relevant authority (NBR, RJSC, BIDA, DPDT, etc.), FAQs, related services, consultation form pre-filled with that service. Each service carries an availability status: Available / Contact for availability / Coming soon (default: Contact for availability, except the 8 you already have). Legal and litigation services clearly labelled as consultancy/documentation support, not legal representation.
5. Business Solutions page (Startup, Small Business, Corporate, Foreign Investor) and a Company Registration Process page with the 6-step timeline and authority-timeline note.
6. Training & Courses: 8 course pages with overview, objectives, syllabus outline and student journey; fees, schedule, instructor and certificate shown only once you enter them; enrolment form saved to the database.
7. FAQs rewritten into your 6 categories with careful, general answers and "verify for the current financial year" notes.
8. Contact page extended (map appears only once an address is saved, social links), footer rebuilt with 4 columns plus Privacy, Terms and a new Disclaimer page.
9. Enquiry form updated: adds Country, Service Category + Specific Service, optional preferred date.

## Stage B — Knowledge Center and admin

- Articles with categories, author, date, reading time, featured image, source and review date, search/filter, share buttons, related articles; written and published from the admin area.
- Admin: manage courses, FAQs, testimonials, service availability; course enrolments list; CSV export.

## Stage C — Client portal (later, on request)

- Client sign-up, own dashboard, service status (Enquiry Received → Completed), secure private document upload/download, messages. Each client sees only their own records.

## Stage D — Payments (needs your decision)

- Invoices and payment status records. bKash/Nagad/Rocket require your own merchant accounts; card payments can use a built-in provider. Nothing shown as "paid" until a real gateway is connected and tested.

## SEO and quality (every stage)

- Unique titles/descriptions/canonical and share tags per page, structured data (organisation, services, FAQ, articles), sitemap.xml generated from all pages, robots.txt, alt text; phone/tablet/desktop checks, link and form tests.

## Technical notes

- Service catalogue moves into the existing `services` table (new columns: category, availability, authority, benefits, process, faqs) via additive migration; existing 8 rows and all inquiries preserved.
- New tables: `courses`, `course_enrollments`, `faq_items`, later `articles`; all with RLS and grants; enrolments follow the same server-validated, rate-limited pattern as inquiries.
- Routes: `/services/$category`, `/services/$category/$slug`, `/business-solutions`, `/company-registration`, `/training`, `/training/$slug`, `/disclaimer`, `/sitemap.xml`; old `/services` stays.