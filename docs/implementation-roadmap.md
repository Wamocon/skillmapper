# Implementation Roadmap

## Delivery principle

Build the smallest valuable slice first: ingestion -> structured profile -> explainable matching -> review workflow.

## Sprint 0 (completed)

- Next.js + Tailwind bootstrap
- Supabase client scaffolding
- Initial migration with base entities
- Local mock workflow from upload to interview analysis

## Sprint 1 (completed in mock scope)

- Structured project analysis schema:
  - header data
  - framework conditions
  - categorized requirements
  - must/can classification
- Structured candidate profile schema:
  - header data
  - categorized skills
  - experience aggregation
- Skill tree visualization with scale `1-10`
- Extension modes for schema growth:
  - `mock`
  - `manual-ai-assisted`

## Sprint 2

- Implement API ingestion endpoints for projects and candidates.
- Persist mapped profiles and custom attributes in Supabase.
- Add deterministic versioned score configuration.
- Add basic validation rules for custom attributes.

## Sprint 3

- Build review queue UI and correction workflow.
- Add correction impact recalculation for scores.
- Add audit trail for manual overrides and AI-assisted enrichments.

## Sprint 4

- Replace mock extraction with parser pipeline (PDF/DOCX/XLSX).
- Add confidence and evidence scoring for extracted attributes.
- Integrate interview note analysis with persisted claims.

## Sprint 5

- Integrate quality metrics dashboard.
- Add observability for extraction and matching quality.
- Prepare GitHub migration and CI/CD pipeline hardening.

## Definition of done for MVP

- End-to-end flow works for project and candidate text ingestion.
- Matching analysis is transparent: score is justified with per-requirement breakdown.
- Competency wheel shows visual comparison (requirement vs. candidate).
- Accordion UX hides complexity by default; details revealed on expansion.
- User can extend attributes in mock and manual+AI-assisted mode.
- Persistence schema supports extensible mapped profiles.
- Deployment remains reproducible on Vercel + Supabase.
