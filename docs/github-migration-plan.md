# GitHub Migration Placeholder Plan

## Goal

Migrate project from local workspace state to a clean GitHub repository with CI/CD and governance defaults.

## Migration triggers

- MVP foundation accepted.
- Initial auth + RLS baseline complete.
- Documentation baseline approved.

## Pre-migration checklist (placeholder)

- [ ] Remove local-only files and sensitive artifacts.
- [ ] Validate `.gitignore` coverage.
- [ ] Confirm no secrets committed.
- [ ] Add license decision.
- [ ] Add contribution and branching model.

## Repository bootstrap steps (placeholder)

1. Create GitHub repo: `skillmapper`.
2. Push current codebase to `main`.
3. Protect `main` with PR requirement.
4. Enable Dependabot and security scanning.
5. Configure GitHub Actions for lint/typecheck/build.
6. Connect Vercel project to GitHub repository.

## Required files before migration

- [ ] `LICENSE`
- [ ] `CONTRIBUTING.md`
- [ ] `.github/pull_request_template.md`
- [ ] `.github/ISSUE_TEMPLATE/*`
- [ ] `.github/workflows/ci.yml`
- [ ] `CODEOWNERS`

## Branch strategy placeholder

- `main`: production-ready
- `develop`: integration
- `feature/*`: short-lived delivery branches

## Open decisions

- [ ] Public vs private repository mode.
- [ ] Mono-repo vs single app repository for later services.
- [ ] Required approval count for protected branches.
- [ ] Release tagging and semantic versioning policy.

## Post-migration validation

- [ ] CI green on default branch.
- [ ] Vercel preview deployment from PRs active.
- [ ] Supabase environment secrets set in GitHub and Vercel.
- [ ] Initial release tag created.
