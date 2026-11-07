# Phase 2 inquiry system

## Owner access
Open Lovable Cloud → Database → `inquiries` to review submissions, newest first by `created_at`. The website dashboard and administrator sign-in belong to Phase 3 and are not included yet.

No notification emails are sent. Owner emails need a paid plan, a verified domain the owner controls, and a confirmed recipient address. A domain bought through Lovable verifies automatically; a domain from another registrar needs DNS verification. Once verified, ask to enable inquiry notifications; domain verification alone does not enable sending.

## Submission and privacy
- `/consultation` accepts the requested contact, service, category, language, consent, optional preferred-time and message fields.
- Shared Zod validation runs both in the browser and in the public POST server function.
- No uploads, financial documents, national IDs or passwords are requested.
- Only validated input reaches a service-only database function. Visitors cannot set internal notes, status or timestamps.
- Row Level Security is enabled. Anonymous and ordinary signed-in users have no inquiry table access and cannot invoke the database submission function directly.
- Each attempt has a random ID reused on retry to prevent duplicates. The database transaction accepts at most three new inquiries per email per hour. This is basic abuse protection, not a full bot prevention service.
- No inquiry data is saved in browser storage or logged.

## Configuration and deployment
Lovable Cloud supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` on the server; the latter must never be browser-visible. Generated integration files contain no literal private key. Database changes live in `drizzle/migrations/` and were applied using Lovable's migration tools. Keep both migrations in deployment history. Publishing through Lovable supplies the managed server environment; another host would require equivalent Worker-compatible runtime configuration and credentials from its backend provider.

## Verification
Eight automated routing/validation tests passed. A browser submission produced the success state and was confirmed in `inquiries`; only that test row was removed. Desktop and phone layout checks passed without browser errors or horizontal overflow. Database access checks confirmed no anonymous/ordinary-user reads or anonymous direct writes/RPC access.

Privacy policy remains an owner-review draft. Retention periods and confirmed business contact details are not invented.