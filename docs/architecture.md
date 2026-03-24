# Skillmapper Architecture (Lean + Free-Tier First)

## Goals

- Keep operational complexity low for MVP.
- Keep mapping explainable and reviewable.
- Provide extensible schemas for requirements and user profiles.
- Keep migration path open for GitHub CI/CD and later scaling.

## Core stack

- Frontend and API: Next.js (App Router)
- Styling: Tailwind CSS
- Data/Auth/Storage: Supabase
- Hosting: Vercel

## High-level flow

1. User creates a project with header data and constraints.
2. User defines roles (team positions) within the project.
3. User creates job postings (Ausschreibungen) for each role with detailed skill requirements.
4. Postings inherit the project context (industry, duration, maturity, phase, constraints).
5. Candidates apply to postings and are matched against posting-level requirements.
6. Matching hub lets the user select a posting, then choose single or batch matching.
7. Matching layer compares must/can requirements from the posting and computes a score.
8. Review layer displays explainability, skill trees, and extension attributes.

## Domain model

### Project → Roles → Postings → Matching

```
Project (context: industry, duration, maturity, phase, constraints)
  └── Role (team position: title, description, fill status)
       └── Job Posting / Ausschreibung (detailed skill requirements, status model)
            └── Match Run (candidate vs. posting requirements → score)
```

- **Project**: defines the organizational context and framework conditions.
- **Role**: a team position within the project. Can be open, placeholder, or filled with a real candidate.
- **Job Posting (Ausschreibung)**: the matchable unit. Contains the detailed skill requirements for a specific role. Has a status lifecycle: draft → active → paused → closed / filled.
- **Match Run**: result of comparing one candidate against one posting.

### Project schema

- Header data:
  - duration
  - industry
  - maturity level
  - project phase
  - framework conditions
- Extension support:
  - `extension_mode` (`mock`, `manual-ai-assisted`)
  - `custom_attributes` (JSON)
  - `mapped_profile` (JSON)

### Role schema

- title
- description
- fill_status: open | placeholder | filled
- assigned_candidate_id (nullable)
- sort_order

### Job Posting (Ausschreibung) schema

- Inherits project context automatically.
- Own detailed requirements split by:
  - tool knowledge
  - hard skills
  - soft skills
  - certifications
- Requirement classification:
  - must (red)
  - can (blue)
- Status model: draft | active | paused | closed | filled
- raw_text for uploaded posting text
- Extension support:
  - `extension_mode` (`mock`, `manual-ai-assisted`)
  - `custom_attributes` (JSON)
  - `mapped_profile` (JSON)

### Candidate schema

- Header data:
  - location
  - availability
  - total project time
  - computed total experience
- Skill split:
  - hard skills
  - soft skills
  - tool skills
  - certifications
- Experience mapping:
  - time per experience/project
  - aggregated project months
  - derived years
- Extension support:
  - `extension_mode` (`mock`, `manual-ai-assisted`)
  - `custom_attributes` (JSON)
  - `mapped_profile` (JSON)

## Component view

### Web App (Next.js)

- Upload and input UI.
- Project management with role and posting creation.
- Posting detail view with inherited project context and own skill tree.
- Matching hub with posting-first selection and mode switch.
- Single matching view with score explanation and interview questions.
- Batch matching view with filtering, sorting, recommendation buckets, and candidate drilldown.

### API layer (Next Route Handlers, planned)

- `POST /api/projects`
- `POST /api/project-roles`
- `POST /api/job-postings`
- `POST /api/candidates`
- `POST /api/match-runs`

### Supabase Postgres

- Canonical data store.
- RLS-protected multi-tenant access.
- JSONB fields for extensible mapped profiles.
- Tables: projects, project_roles, job_postings, candidates, match_runs.

## Security and compliance baseline

- RLS enabled from first migration.
- Placeholder policies currently open for early integration speed.
- Next step: enforce strict tenant-based policies and role checks.

## Open architecture decisions

- [ARCH-001] App Router APIs vs dedicated backend service split timing.
- [ARCH-002] Edge runtime vs Node runtime for extraction endpoints.
- [ARCH-003] Transaction model for review corrections and audit events.
- [ARCH-004] Storage partitioning strategy for multi-tenant growth.
