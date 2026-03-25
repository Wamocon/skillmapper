-- Seed data for 'test' schema (local development)
-- Matches the mock data in lib/mock-records.ts
-- Run AFTER all 6 migrations. Safe to re-run (ON CONFLICT DO NOTHING).
-- Auth users are created separately via scripts/seed.ts using the admin API.

-- ─── Test Tenant ──────────────────────────────────────────────────────────────

insert into test.tenants (id, name, slug, license_type, max_users, max_projects)
values (
  '00000000-0000-0000-0000-000000000001',
  'Kompetenzkompass Demo',
  'demo',
  'professional',
  20,
  50
) on conflict (id) do nothing;

-- ─── Test Users (auth_uid matches scripts/seed.ts created auth users) ─────────

insert into test.users (id, auth_uid, email, full_name, phone, phone_verified, role, status, locale, tenant_id, accepted_terms_at, accepted_privacy_at)
values
  ('00000000-0000-0000-0001-000000000001',
   null, -- populated by scripts/seed.ts
   'admin@kompetenzkompass.de','Demo Admin','+49 170 1234567',true,'admin','active','de',
   '00000000-0000-0000-0000-000000000001','2026-01-01T00:00:00Z','2026-01-01T00:00:00Z'),
  ('00000000-0000-0000-0001-000000000002',
   null,
   'manager@kompetenzkompass.de','Petra Manager','+49 170 2345678',true,'manager','active','de',
   '00000000-0000-0000-0000-000000000001','2026-02-01T00:00:00Z','2026-02-01T00:00:00Z'),
  ('00000000-0000-0000-0001-000000000003',
   null,
   'user@kompetenzkompass.de','Karl Nutzer','+49 170 3456789',false,'user','active','en',
   '00000000-0000-0000-0000-000000000001','2026-03-01T00:00:00Z','2026-03-01T00:00:00Z'),
  ('00000000-0000-0000-0001-000000000004',
   null,
   'invited@kompetenzkompass.de','Eingeladener Benutzer',null,false,'user','invited','de',
   '00000000-0000-0000-0000-000000000001',null,null)
on conflict (id) do nothing;

-- ─── Test License ─────────────────────────────────────────────────────────────

insert into test.licenses (id, tenant_id, license_type, scope, max_units, used_units, valid_from, valid_until)
values (
  '00000000-0000-0000-0002-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'professional', 'user', 20, 4, '2026-01-01T00:00:00Z', '2027-01-01T00:00:00Z'
) on conflict (id) do nothing;

-- ─── Test Projects ────────────────────────────────────────────────────────────

insert into test.projects (id, tenant_id, title, description, source_type, raw_text, status, created_by, extension_mode, custom_attributes, duration_months, industry, maturity, phase, constraints, additional_attributes, created_at, updated_at)
values
  ('00000000-0000-0000-0003-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'Kompetenzkompass MVP Ausschreibung',
   'Next.js + TypeScript + Supabase Plattform mit Skill-Matching',
   'tender',
   'Dauer 9 Monate, Branche HR-Tech, Reifegrad Pilot, Projektphase Delivery. Rahmenbedingungen: Remote first, DSGVO, enge Abstimmung mit Fachbereich. Muss: Next.js, React, TypeScript, Architektur, Kommunikation, Scrum, AWS Certified. Kann: Tailwind, Supabase, Testing.',
   'active',
   '00000000-0000-0000-0001-000000000001',
   'mock',
   '{"compliance_level":"hoch","team_size":"8"}',
   9,'HR-Tech','pilot','delivery',
   '["Remote first","DSGVO","Budgetdeckel"]',
   '["Stakeholder-Komplexität","Reiseanteil"]',
   '2026-03-20T10:00:00Z','2026-03-20T10:00:00Z'),
  ('00000000-0000-0000-0003-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'Frontend-Relaunch',
   'React + Tailwind Redesign mit Barrierefreiheit',
   'project-brief',
   'Dauer 6 Monate, Branche E-Commerce, Reifegrad Rollout, Projektphase Discovery. Rahmenbedingungen: Hybrid, hoher Zeitdruck. Muss: React, Accessibility, UI-Testing. Kann: TypeScript, Figma.',
   'draft',
   '00000000-0000-0000-0001-000000000001',
   'manual-ai-assisted',
   '{"target_markets":"DACH, Nordics"}',
   6,'E-Commerce','rollout','discovery',
   '["Hybrid","Go-live Fixtermin"]',
   '["Barrierefreiheitsniveau"]',
   '2026-03-18T14:00:00Z','2026-03-18T14:00:00Z'),
  ('00000000-0000-0000-0003-000000000003',
   '00000000-0000-0000-0000-000000000001',
   'Data-Pipeline Erweiterung',
   'Python ETL Pipeline mit PostgreSQL und Redis',
   'tender',
   'Dauer 12 Monate, Branche FinTech, Reifegrad Scale, Projektphase Stabilization. Rahmenbedingungen: On-Prem Security, Audits. Muss: Python, Datenmodellierung, SQL. Kann: Redis, Observability.',
   'archived',
   '00000000-0000-0000-0001-000000000001',
   'manual-ai-assisted',
   '{"criticality":"tier-1"}',
   12,'FinTech','scale','stabilization',
   '["On-Prem","Auditpflicht"]',
   '["Bereitschaftsdienst"]',
   '2026-02-10T09:00:00Z','2026-03-01T09:00:00Z')
on conflict (id) do nothing;

-- ─── Test Candidates ──────────────────────────────────────────────────────────

insert into test.candidates (id, tenant_id, full_name, email, cv_raw_text, created_by, extension_mode, custom_attributes, location, availability_weeks, experiences, total_project_months, additional_attributes, created_at)
values
  ('00000000-0000-0000-0004-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'Max Beispiel','max@beispiel.de',
   '6 Jahre React TypeScript, 4 Jahre Next.js, 2 Jahre Supabase, Scrum, Moderation, AWS Certified. Projekte: Recruiting Suite 18 Monate, Talent API 12 Monate.',
   '00000000-0000-0000-0001-000000000001','mock',
   '{"travel_readiness":"ja","notice_period":"4 Wochen"}',
   'Berlin',4,
   '[{"project_name":"Recruiting Suite","duration_months":18,"role":"Lead Frontend"},{"project_name":"Talent API","duration_months":12,"role":"Fullstack Engineer"}]',
   30,'["Branchenfit","Führungserfahrung"]','2026-03-19T08:00:00Z'),
  ('00000000-0000-0000-0004-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'Anna Schmidt','anna.schmidt@mail.de',
   '5 Jahre Python Django, 3 Jahre Data Science, Teamcoaching, Kommunikation. Zertifikate: Professional Scrum Master. Projekte: Pricing Engine 16 Monate, Forecasting 10 Monate.',
   '00000000-0000-0000-0001-000000000001','manual-ai-assisted',
   '{"willingness_remote":"80%"}',
   'Hamburg',8,
   '[{"project_name":"Pricing Engine","duration_months":16,"role":"Backend Engineer"},{"project_name":"Forecasting","duration_months":10,"role":"Data Engineer"}]',
   26,'["Domain-Wissen Retail"]','2026-03-18T15:00:00Z'),
  ('00000000-0000-0000-0004-000000000003',
   '00000000-0000-0000-0000-000000000001',
   'Tom Müller','tom.mueller@firma.de',
   '8 Jahre Java Spring Boot Microservices, Architektur, Incident-Management, Kommunikation. Zertifikate: ISTQB Foundation. Projekte: Core Banking 24 Monate, Billing 14 Monate.',
   '00000000-0000-0000-0001-000000000001','manual-ai-assisted',
   '{"shift_readiness":"nein"}',
   'München',6,
   '[{"project_name":"Core Banking","duration_months":24,"role":"Senior Engineer"},{"project_name":"Billing","duration_months":14,"role":"Tech Lead"}]',
   38,'["Regulatorik-Erfahrung"]','2026-03-15T11:00:00Z'),
  ('00000000-0000-0000-0004-000000000004',
   '00000000-0000-0000-0000-000000000001',
   'Lena Weber','lena.weber@mail.de',
   '4 Jahre React TypeScript, 3 Jahre Next.js, Tailwind, Testing. Projekte: Shop Portal 20 Monate, Internal Dashboard 14 Monate.',
   '00000000-0000-0000-0001-000000000001','mock',
   '{"remote_preference":"hybrid"}',
   'München',2,
   '[{"project_name":"Shop Portal","duration_months":20,"role":"Frontend Engineer"},{"project_name":"Internal Dashboard","duration_months":14,"role":"UI Developer"}]',
   34,'["E-Commerce-Erfahrung"]','2026-03-17T10:00:00Z'),
  ('00000000-0000-0000-0004-000000000005',
   '00000000-0000-0000-0000-000000000001',
   'Felix Hoffmann','felix.hoffmann@mail.de',
   '8 Jahre Architektur System Design, 5 Jahre Java Spring Boot, Kommunikation Stakeholder, Scrum. Projekte: ERP System 36 Monate, API Gateway 18 Monate.',
   '00000000-0000-0000-0001-000000000001','manual-ai-assisted',
   '{"leadership":"ja"}',
   'Frankfurt',12,
   '[{"project_name":"ERP System","duration_months":36,"role":"Solution Architect"},{"project_name":"API Gateway","duration_months":18,"role":"Tech Lead"}]',
   54,'["Enterprise-Erfahrung","Führungserfahrung"]','2026-03-16T10:00:00Z'),
  ('00000000-0000-0000-0004-000000000006',
   '00000000-0000-0000-0000-000000000001',
   'Sophie Koch','sophie.koch@mail.de',
   '2 Jahre React, 1 Jahr Next.js, Supabase. Projekt: Startup App 14 Monate.',
   '00000000-0000-0000-0001-000000000001','mock','{}',
   'Hamburg',1,
   '[{"project_name":"Startup App","duration_months":14,"role":"Junior Developer"}]',
   14,'["Startup-Erfahrung"]','2026-03-15T10:00:00Z'),
  ('00000000-0000-0000-0004-000000000007',
   '00000000-0000-0000-0000-000000000001',
   'Klaus Bauer','klaus.bauer@mail.de',
   '5 Jahre Testing Jest Playwright ui-testing, 3 Jahre TypeScript React, Scrum agile. Projekte: QA Suite 20 Monate, Test Automation 18 Monate.',
   '00000000-0000-0000-0001-000000000001','mock',
   '{"istqb":"foundation"}',
   'Remote-DE',8,
   '[{"project_name":"QA Suite","duration_months":20,"role":"QA Engineer"},{"project_name":"Test Automation","duration_months":18,"role":"Senior QA"}]',
   38,'["QA-Expertise"]','2026-03-14T10:00:00Z'),
  ('00000000-0000-0000-0004-000000000008',
   '00000000-0000-0000-0000-000000000001',
   'Julia Fischer','julia.fischer@mail.de',
   '6 Jahre TypeScript React, 4 Jahre Next.js, Architektur, Kommunikation Stakeholder, Scrum, AWS Certified. Projekte: HR Platform 24 Monate, Employee Portal 20 Monate.',
   '00000000-0000-0000-0001-000000000001','mock',
   '{"aws_level":"solutions-architect"}',
   'Berlin',3,
   '[{"project_name":"HR Platform","duration_months":24,"role":"Lead Engineer"},{"project_name":"Employee Portal","duration_months":20,"role":"Senior Engineer"}]',
   44,'["HR-Tech-Erfahrung","Cloud-Expertise"]','2026-03-13T10:00:00Z'),
  ('00000000-0000-0000-0004-000000000009',
   '00000000-0000-0000-0000-000000000001',
   'Erik Wagner','erik.wagner@mail.de',
   '3 Jahre Tailwind React, 2 Jahre Testing ui-testing. Projekte: Marketing Portal 16 Monate, Landing Suite 10 Monate.',
   '00000000-0000-0000-0001-000000000001','manual-ai-assisted','{}',
   'Leipzig',6,
   '[{"project_name":"Marketing Portal","duration_months":16,"role":"Frontend Dev"},{"project_name":"Landing Suite","duration_months":10,"role":"UI Developer"}]',
   26,'["Marketing-Tech"]','2026-03-12T10:00:00Z'),
  ('00000000-0000-0000-0004-000000000010',
   '00000000-0000-0000-0000-000000000001',
   'Nina Schulz','nina.schulz@mail.de',
   '7 Jahre Python, 5 Jahre Architektur System Design, Kommunikation Stakeholder, 3 Jahre Postgres Supabase. Projekte: Analytics Platform 30 Monate, Data Suite 24 Monate.',
   '00000000-0000-0000-0001-000000000001','manual-ai-assisted',
   '{"domain":"data"}',
   'Remote-DE',4,
   '[{"project_name":"Analytics Platform","duration_months":30,"role":"Data Architect"},{"project_name":"Data Suite","duration_months":24,"role":"Backend Lead"}]',
   54,'["Data-Engineering","Cloud-Architektur"]','2026-03-11T10:00:00Z')
on conflict (id) do nothing;

-- ─── Test Project Roles ───────────────────────────────────────────────────────

insert into test.project_roles (id, project_id, tenant_id, title, description, fill_status, assigned_candidate_id, sort_order, created_at, updated_at)
values
  ('00000000-0000-0000-0005-000000000001',
   '00000000-0000-0000-0003-000000000001','00000000-0000-0000-0000-000000000001',
   'Lead Frontend Engineer','Verantwortlich für die gesamte Frontend-Architektur und Umsetzung.',
   'open',null,1,'2026-03-20T10:00:00Z','2026-03-20T10:00:00Z'),
  ('00000000-0000-0000-0005-000000000002',
   '00000000-0000-0000-0003-000000000001','00000000-0000-0000-0000-000000000001',
   'Backend Developer','API-Entwicklung und Datenbankintegration mit Supabase.',
   'placeholder',null,2,'2026-03-20T10:00:00Z','2026-03-20T10:00:00Z'),
  ('00000000-0000-0000-0005-000000000003',
   '00000000-0000-0000-0003-000000000001','00000000-0000-0000-0000-000000000001',
   'QA Engineer','Qualitätssicherung und Testautomatisierung.',
   'filled','00000000-0000-0000-0004-000000000007',3,'2026-03-20T10:00:00Z','2026-03-21T08:00:00Z'),
  ('00000000-0000-0000-0005-000000000004',
   '00000000-0000-0000-0003-000000000002','00000000-0000-0000-0000-000000000001',
   'UI/UX Developer','Umsetzung des Redesigns mit Fokus auf Barrierefreiheit.',
   'open',null,1,'2026-03-18T14:00:00Z','2026-03-18T14:00:00Z'),
  ('00000000-0000-0000-0005-000000000005',
   '00000000-0000-0000-0003-000000000003','00000000-0000-0000-0000-000000000001',
   'Data Engineer','Aufbau und Betrieb der ETL-Pipeline.',
   'open',null,1,'2026-02-10T09:00:00Z','2026-02-10T09:00:00Z')
on conflict (id) do nothing;

-- ─── Test Job Postings ────────────────────────────────────────────────────────

insert into test.job_postings (id, project_id, role_id, tenant_id, title, description, raw_text, status, extension_mode, custom_attributes, created_by, duration_months, industry, maturity, phase, constraints, additional_attributes, created_at, updated_at)
values
  ('00000000-0000-0000-0006-000000000001',
   '00000000-0000-0000-0003-000000000001','00000000-0000-0000-0005-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'Lead Frontend Engineer – Kompetenzkompass MVP',
   'Wir suchen einen erfahrenen Frontend-Entwickler mit Fokus auf Next.js und TypeScript.',
   'Dauer 9 Monate, Branche HR-Tech, Reifegrad Pilot, Projektphase Delivery. Rahmenbedingungen: Remote first, DSGVO, enge Abstimmung mit Fachbereich. Muss: Next.js, React, TypeScript, Architektur, Kommunikation, Scrum, AWS Certified. Kann: Tailwind, Supabase, Testing.',
   'active','mock','{"seniority":"senior","team_lead":"ja"}',
   '00000000-0000-0000-0001-000000000001',
   9,'HR-Tech','pilot','delivery',
   '["Remote first","DSGVO","Budgetdeckel"]',
   '["Stakeholder-Komplexität","Reiseanteil"]',
   '2026-03-20T10:30:00Z','2026-03-20T10:30:00Z'),
  ('00000000-0000-0000-0006-000000000002',
   '00000000-0000-0000-0003-000000000001','00000000-0000-0000-0005-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'Backend Developer – Kompetenzkompass MVP',
   'API-Entwicklung mit Supabase und TypeScript, Schwerpunkt Datenmodellierung.',
   'Dauer 9 Monate, Branche HR-Tech, Reifegrad Pilot, Projektphase Delivery. Rahmenbedingungen: Remote first, DSGVO. Muss: TypeScript, Supabase, Datenmodellierung, SQL, Testing. Kann: Next.js, Redis, Observability.',
   'active','mock','{"seniority":"mid-senior"}',
   '00000000-0000-0000-0001-000000000001',
   9,'HR-Tech','pilot','delivery',
   '["Remote first","DSGVO"]',
   '["Stakeholder-Komplexität"]',
   '2026-03-20T11:00:00Z','2026-03-20T11:00:00Z'),
  ('00000000-0000-0000-0006-000000000003',
   '00000000-0000-0000-0003-000000000002','00000000-0000-0000-0005-000000000004',
   '00000000-0000-0000-0000-000000000001',
   'UI/UX Developer – Frontend-Relaunch',
   'React + Tailwind Redesign mit Fokus auf Barrierefreiheit und Performance.',
   'Dauer 6 Monate, Branche E-Commerce, Reifegrad Rollout, Projektphase Discovery. Rahmenbedingungen: Hybrid, hoher Zeitdruck. Muss: React, Accessibility, UI-Testing. Kann: TypeScript, Figma.',
   'active','manual-ai-assisted','{"focus":"accessibility"}',
   '00000000-0000-0000-0001-000000000001',
   6,'E-Commerce','rollout','discovery',
   '["Hybrid","Go-live Fixtermin"]',
   '["Barrierefreiheitsniveau"]',
   '2026-03-18T14:30:00Z','2026-03-18T14:30:00Z'),
  ('00000000-0000-0000-0006-000000000004',
   '00000000-0000-0000-0003-000000000003','00000000-0000-0000-0005-000000000005',
   '00000000-0000-0000-0000-000000000001',
   'Data Engineer – Data-Pipeline Erweiterung',
   'Python ETL Pipeline mit PostgreSQL und Redis.',
   'Dauer 12 Monate, Branche FinTech, Reifegrad Scale, Projektphase Stabilization. Rahmenbedingungen: On-Prem Security, Audits. Muss: Python, Datenmodellierung, SQL. Kann: Redis, Observability.',
   'closed','manual-ai-assisted','{"clearance":"required"}',
   '00000000-0000-0000-0001-000000000001',
   12,'FinTech','scale','stabilization',
   '["On-Prem","Auditpflicht"]',
   '["Bereitschaftsdienst"]',
   '2026-02-10T09:30:00Z','2026-03-15T09:00:00Z'),
  ('00000000-0000-0000-0006-000000000005',
   '00000000-0000-0000-0003-000000000001','00000000-0000-0000-0005-000000000003',
   '00000000-0000-0000-0000-000000000001',
   'QA Engineer – Kompetenzkompass MVP',
   'Testautomatisierung und Qualitätssicherung für die Matching-Plattform.',
   'Dauer 9 Monate, Branche HR-Tech, Reifegrad Pilot, Projektphase Delivery. Rahmenbedingungen: Remote first, DSGVO. Muss: Testing, TypeScript, Scrum. Kann: Playwright, Jest.',
   'filled','mock','{}',
   '00000000-0000-0000-0001-000000000001',
   9,'HR-Tech','pilot','delivery',
   '["Remote first","DSGVO"]','[]',
   '2026-03-20T11:30:00Z','2026-03-21T08:00:00Z')
on conflict (id) do nothing;

-- ─── Test Match Runs ──────────────────────────────────────────────────────────

insert into test.match_runs (id, tenant_id, project_id, posting_id, candidate_id, score, summary, created_at)
values
  ('00000000-0000-0000-0007-000000000001',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0003-000000000001',
   '00000000-0000-0000-0006-000000000001',
   '00000000-0000-0000-0004-000000000001',
   87.5,'Max Beispiel: Starke Next.js/React-Kompetenz, AWS Certified. Empfehlung: Geeignet.',
   '2026-03-22T10:00:00Z'),
  ('00000000-0000-0000-0007-000000000002',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0003-000000000001',
   '00000000-0000-0000-0006-000000000001',
   '00000000-0000-0000-0004-000000000008',
   91.0,'Julia Fischer: Sehr gute Passung für Lead-Rolle. AWS Solutions Architect. Empfehlung: Geeignet.',
   '2026-03-22T10:30:00Z'),
  ('00000000-0000-0000-0007-000000000003',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0003-000000000001',
   '00000000-0000-0000-0006-000000000001',
   '00000000-0000-0000-0004-000000000004',
   72.0,'Lena Weber: Gute Frontend-Skills, aber weniger Scrum/Architektur-Erfahrung. Empfehlung: Bedingt geeignet.',
   '2026-03-22T11:00:00Z')
on conflict (id) do nothing;
