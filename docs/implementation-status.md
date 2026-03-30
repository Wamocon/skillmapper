# Kompetenzkompass Implementation Status

## Last update

- Date: 2026-03-30
- Stage: V1 Finalization — Production-ready UI, Supabase-connected, KI-gestütztes Matching
- Stack: Next.js, Tailwind, Supabase, Vercel-ready

## Current implementation state

### Completed

- Base Next.js project scaffold created.
- Tailwind CSS configured with initial design tokens.
- Local workflow from project/candidate input to matching and interview questions.
- **Roles and job postings (Ausschreibungen) model implemented:**
  - Projects contain roles (team positions) with fill status: open, placeholder, filled.
  - Each role can have one or more job postings (Ausschreibungen).
  - Postings inherit project context (duration, industry, phase, constraints).
  - Postings contain their own detailed skill requirements.
  - Postings have a status lifecycle: draft → active → paused → closed / filled.
  - Postings support priority levels (high, medium, low) with color-coded display.
  - Postings support raw text upload.
- **Matching rewired to postings:**
  - Matching hub now selects active postings instead of projects.
  - Both single matching and batch matching work against posting requirements.
  - Posting analysis inherits project header data and derives requirements from posting text.
- Structured project mapping implemented:
  - duration, industry, project phase (SDLC: Requirements, Design, Implementation, Testing, Deployment, Maintenance), framework conditions
- Requirement mapping implemented with categories:
  - tool knowledge, hard skills, soft skills, certifications
- Requirement classification with Pflicht/Optional badges.
- Candidate profile mapping implemented in unified schema.
- Skill tree visualization with category grouping, circular level rings, and hover details.
- Score justification list with impact classification.
- Matching hub with posting-first selection and explicit mode switch.
- Batch matching with filterable multiselect, sortable results, drilldown.
- Extension workflow implemented (manual + AI-assisted mode).
- All mock badges, labels, and mock-mode indicators removed from UI.
- Adapter functions renamed from toMock* to production names.
- Legal pages (AGB, Datenschutz, Impressum) expanded and updated.
- Supabase schema extended with `project_roles` and `job_postings` tables.
- Domain fields (`duration_months`, `industry`, `phase`, `constraints`, `additional_attributes`) added for projects/candidates/postings.
- Posting priority field (`high`, `medium`, `low`) with color-coded card display.
- Dashboard match results table: clickable match count shows all match runs in a sortable table.
- Project detail view: inline editing of all fields with permission check, direct role creation in Roles & Postings section.
- Postings page: create new postings, full filter bar (status, priority, industry), prominent color-coded status/priority badges.
- Candidate detail view: inline editing with permission check, comments system with timestamps, author tracking, editing and archiving.
- Candidate comments stored in `candidate_comments` table with RLS.
- RLS moved from placeholder policies to tenant-based policies using `auth.uid()` helpers.
- `test` schema created for local development and seeded workflow.
- DB service layer implemented in `lib/db/service.ts`.
- Auth context switched to Supabase auth sessions (`signInWithPassword`, `signUp`, `signOut`).
- Major UI routes switched from mock-records to DB reads (projects, candidates, postings, matching, admin users).

### In progress

- Tightening RLS for cross-tenant edge cases and write operations.
- Persisting generated interview question sets in dedicated DB tables.

### Not started / V2 backlog

- Full Supabase Auth integration (replace localStorage session).
- Password reset flow.
- Payment gateway integration (Stripe or similar).
- PDF/DOCX upload and parsing.
- Candidate creation persistence (form → DB).
- E-Mail/Push notifications.
- Data export (CSV/PDF).
- Rate limiting for API routes.
- Usage limits enforcement (server-side).
- Observability and cost dashboards.

## Decisions log

### Decided

- Keep architecture lean and operationally simple for MVP.
- Enforce explainable score model from day one.
- Keep mapping schema extensible via JSON attributes and mode switching.
- Matching operates at the posting level, not the project level.
- Postings inherit project context but own their skill requirements.
- Branding decision: product name changed to Kompetenzkompass (DACH-first positioning).

### Pending decisions

- [DECISION-001] Tenant model: single-table tenant isolation vs dedicated schema strategy.
- [DECISION-002] Upload handling: direct-to-storage signed uploads vs API relay uploads.
- [DECISION-003] Extraction model provider strategy: single provider vs fallback model chain.

## Change log

- 2026-03-30: V1 Finalisierung — Mock-Bereinigung, Legal-Seiten-Update, Dokumentation aktualisiert.
- 2026-03-26: Dashboard match results table, project/candidate inline editing, comments system, posting filters/priorities, SDLC phase model, removed Reifegrad.
- 2026-03-24: Rebranding rollout to Kompetenzkompass and landingpage briefing bundle added.
- 2026-03-25: Roles and postings model implemented. Matching rewired to postings.
- 2026-03-24: Matching hub with single and batch flows added across app navigation and docs.
- 2026-03-24: Structured project/candidate mapping and skill tree enhancement implemented.
- 2026-03-23: Initial foundation implementation and documentation bootstrap.

## Related documentation

- Architecture: `docs/architecture.md`
- Delivery roadmap: `docs/implementation-roadmap.md`
- V1 offene Punkte: `docs/v1-offene-punkte.md`
- Landingpage briefing bundle: `docs/landingpage/README.md`
