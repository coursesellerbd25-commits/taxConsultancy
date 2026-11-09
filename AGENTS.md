## Project rules
- Professional statistics use the centralized src/content/statistics.ts source with nullable owner-confirmed values; viewport-triggered counters stay client-side and never infer achievements from catalogue data.
- Site search indexes the owner-filtered catalogue, courses and public pages locally; VAT arithmetic uses only the visitor-entered rate, keeping estimates independent of unverified tax rules.
- Business details and services live in the site_settings/services tables (read via src/lib/site-data.ts, loaded in the root loader); src/content/site.ts is only the fallback and holds FAQs/credentials, so the owner edits without code.
- Admin access = admin row in user_roles (first signup auto-granted by trigger); admin pages under /admin are client-only and use RLS + column grants so admins can only change inquiry status/notes.
- Inquiry input uses a shared Zod schema on client and server; only the validated public server function may call the service-only submission RPC, preventing public access to private rows.
- Inquiry submission IDs are reused on retries, and database transactions enforce idempotency and a per-email hourly limit to avoid duplicates and reduce abuse.
- The full service/course catalogue lives in src/content/catalog.ts (category-level detail content reused by every service page); the DB services table only overrides/hides the original 8 services, and the inquiry server function accepts only catalogue slugs not hidden in the DB.
- Course enrolment enquiries reuse the inquiries table with a "course-" slug prefix, so the admin inbox shows both without a second pipeline.
