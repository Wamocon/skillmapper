# Kompetenzkompass

Lightweight MVP foundation for Kompetenzkompass with:

- Next.js App Router
- Tailwind CSS
- Supabase integration scaffolding
- Vercel-ready deployment setup

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Local mock workflow (current)

The app now provides a fully local, visible workflow with a structured schema for project requirements and candidate profiles:

- Project upload/input with header mapping:
  - duration
  - industry
  - project maturity and phase
  - framework conditions
- Technical requirement mapping split by:
  - tool knowledge
  - hard skills
  - soft skills
  - certifications
- Requirement split in:
  - must requirements (red in skill tree)
  - can requirements (blue in skill tree)
- Candidate profile mapping in the same schema:
  - header data
  - soft skills
  - hard skills
  - tool knowledge
  - experience in time
  - total project time + derived experience years
- Project-specific skill tree comparison with scale `1-10`
- Matching hub with two execution modes:
  - single matching for one candidate in one project context
  - batch matching for multiple candidates in the same project context
- Extension mode for attributes and user data:
  - `mock`
  - `manual-ai-assisted`

Batch matching can be opened from project cards, project detail pages, dashboard quick actions, and the matching page itself.

Use guide page at `/anleitung` for visual walkthrough.

## Environment variables

Copy `.env.example` to `.env.local` and fill:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Supabase

Migrations:

- `supabase/migrations/20260323_001_init.sql`
- `supabase/migrations/20260324_002_users_roles_licensing.sql`

The second migration now includes extensible mapping fields (`extension_mode`, `custom_attributes`, `mapped_profile`) on `projects` and `candidates`.

## Deployment

Deploy to Vercel:

1. Import repository in Vercel
2. Set the environment variables
3. Use default Next.js build settings

## Documentation

Implementation status and roadmap are in:

- `docs/implementation-status.md`
- `docs/implementation-roadmap.md`

Additional docs:

- `docs/architecture.md`
- `docs/local-mock-workflow.md`
- `docs/mocked-features.md`
- `docs/skills-inventory.md`
- `docs/github-migration-plan.md`
- `docs/landingpage/README.md`
- `docs/landingpage/01-strategie-fachlich-marketing.de.json`
- `docs/landingpage/02-copydeck-landingpage.de.json`
- `docs/landingpage/03-brand-system-kompetenzkompass.de.json`
- `docs/landingpage/04-logo-guidelines-kompetenzkompass.de.json`
