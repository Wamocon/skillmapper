# Kompetenzkompass: Systemdokumentation und Testzugang

Stand: 2026-03-25

## 1) Ziel der Applikation

Kompetenzkompass ist eine webbasierte Plattform zur strukturierten Erfassung von Projektanforderungen und Kandidatenprofilen sowie zum nachvollziehbaren Matching zwischen Ausschreibungen und Kandidaten.

Die Applikation unterstützt:
- Projektanlage mit Rollen und Ausschreibungen
- KI-nahe, strukturierte Anforderungs- und Profilableitung (aktuell regelbasiert/mock-gestuetzt)
- Einzelmatching und Batch-Matching
- Begruendete Scoring-Logik
- Rollen- und Lizenzverwaltung im Admin-Bereich

## 2) Aktueller Entwicklungsstand

Der aktuelle Stand ist ein Supabase-angebundenes MVP mit produktionsnaher Datenstruktur.

### Bereits umgesetzt

- Next.js App Router Frontend mit Tailwind UI
- Supabase Auth-Integration (Login, Registrierung, Session)
- Mandanten-/Benutzermodell
- Projekte, Kandidaten, Rollen, Ausschreibungen, Match-Runs
- RLS-Strategie (tenant-orientiert) fuer zentrale Tabellen
- Mehrere Umgebungsmodi ueber Schema-Auswahl
- Seed-Pipeline fuer reproduzierbare Testdaten

### Noch offen / in Arbeit

- Persistenz fuer Interviewfragen als eigene Tabellen
- nicht-mock Extraktionspipelines (Projekt/CV)
- weitergehende API-Schicht fuer Ingestion-Prozesse
- erweitertes Monitoring und Betriebsauswertung

## 3) Technischer Stack

- Frontend: Next.js 16, React 19, TypeScript
- Styling: Tailwind CSS
- Backend/Data: Supabase (Postgres, Auth, RLS)
- Lint/Qualitaet: ESLint 9 Flat Config
- Build: TypeScript Typecheck + Next Build

## 4) Kernbereiche der Anwendung

- Dashboard
- Projekte (Liste + Detail)
- Kandidaten (Liste + Detail)
- Ausschreibungen/Job Postings (Liste + Detail)
- Matching Hub (Single + Batch)
- Admin (Benutzer + Lizenzen)
- Benachrichtigungen
- Registrierung/Login

## 5) Datenbankstatus (verifiziert)

Migrationen sind auf dem verlinkten Supabase-Projekt synchron angewendet.

Aktive Migrationskette:
- 20260325152800_001_init.sql
- 20260325152900_002_users_roles_licensing.sql
- 20260325153000_003_roles_postings.sql
- 20260325153100_004_extend_domain_fields.sql
- 20260325153200_005_rls_policies.sql
- 20260325153300_006_test_schema.sql

Verifizierte Datensatzanzahl (public, Seed-Stand):
- tenants: 1
- users: 4
- projects: 3
- candidates: 5
- project_roles: 5
- job_postings: 5
- match_runs: 2
- licenses: 1

## 6) Testzugang fuer vollumfaenglichen Funktionstest

Wichtiger Hinweis:
- Diese Zugangsdaten sind ausschliesslich fuer Test-/Staging-Zwecke gedacht.
- In produktiven Umgebungen muessen Passwoerter und Seed-Zugaenge ausgetauscht werden.

### Login-Zugaenge (Auth-User)

Gemeinsames Passwort fuer die Seed-Logins:
- ChangeMe!12345

Benutzer 1 (Admin):
- E-Mail: admin@kompetenzkompass.de
- Rolle: admin
- Status: active
- Erwarteter Zugriff: Vollzugriff inkl. Admin-Bereich

Benutzer 2 (Manager):
- E-Mail: manager@kompetenzkompass.de
- Rolle: manager
- Status: active
- Erwarteter Zugriff: Operativer Zugriff ohne volle Admin-Rechte

Benutzer 3 (User):
- E-Mail: user@kompetenzkompass.de
- Rolle: user
- Status: active
- Erwarteter Zugriff: Basiszugriff auf normale Bereiche

### Angelegter, aber nicht als Auth-Login nutzbarer Datensatz

Benutzer 4 (Invited):
- E-Mail: invited@kompetenzkompass.de
- Rolle: user
- Status: invited
- Hinweis: Kein Auth-Login hinterlegt (auth_uid = null), dient fuer Einladungs-/Statusszenarien

## 7) Schnelltest-Checkliste

1. Login als Admin und Aufruf von Dashboard, Projekte, Kandidaten, Matching, Admin.
2. Login als Manager und Pruefung rollenbasierter Sichtbarkeit.
3. Login als User und Pruefung eingeschraenkter Berechtigungen.
4. Oeffnen eines aktiven Postings und Start von Single-Matching.
5. Start von Batch-Matching mit mehreren Kandidaten.
6. Pruefung, ob Daten aus DB geladen werden (keine Mock-Abhaengigkeit in Kernseiten).
7. Test von Status-/Rollenwechsel im Admin-Bereich.

## 8) Umgebungen und Schema-Strategie

Konfiguration ueber NEXT_PUBLIC_DB_SCHEMA:
- test: lokale Entwicklung/Testbetrieb
- public: Vercel-Testumgebung und produktionsnaher Betrieb

Empfehlung fuer Deployment:
- lokal: test
- vercel test: public
- production: public (mit produktiver Domain und geharteten Secrets)

## 9) Relevante Dokumente

- docs/implementation-status.md
- docs/implementation-roadmap.md
- docs/architecture.md
- docs/prompts/01-project-posting-extraction.prompt.md
- docs/prompts/02-candidate-extraction.prompt.md
- docs/prompts/03-kompetenzkompass-matching.prompt.md
- docs/prompts/04-interview-questions.prompt.md
