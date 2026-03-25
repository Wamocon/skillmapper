import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const schema = process.env.SEED_SCHEMA ?? process.env.NEXT_PUBLIC_DB_SCHEMA ?? "test";

if (!url || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  db: { schema },
  auth: { persistSession: false, autoRefreshToken: false },
});

const IDS = {
  tenant: "00000000-0000-0000-0000-000000000001",
  users: {
    admin: "00000000-0000-0000-0001-000000000001",
    manager: "00000000-0000-0000-0001-000000000002",
    user: "00000000-0000-0000-0001-000000000003",
    invited: "00000000-0000-0000-0001-000000000004",
  },
  projects: {
    p1: "00000000-0000-0000-0003-000000000001",
    p2: "00000000-0000-0000-0003-000000000002",
    p3: "00000000-0000-0000-0003-000000000003",
  },
  roles: {
    r1: "00000000-0000-0000-0005-000000000001",
    r2: "00000000-0000-0000-0005-000000000002",
    r3: "00000000-0000-0000-0005-000000000003",
    r4: "00000000-0000-0000-0005-000000000004",
    r5: "00000000-0000-0000-0005-000000000005",
  },
  postings: {
    j1: "00000000-0000-0000-0006-000000000001",
    j2: "00000000-0000-0000-0006-000000000002",
    j3: "00000000-0000-0000-0006-000000000003",
    j4: "00000000-0000-0000-0006-000000000004",
    j5: "00000000-0000-0000-0006-000000000005",
  },
  candidates: {
    c1: "00000000-0000-0000-0004-000000000001",
    c2: "00000000-0000-0000-0004-000000000002",
    c3: "00000000-0000-0000-0004-000000000003",
    c4: "00000000-0000-0000-0004-000000000004",
    c5: "00000000-0000-0000-0004-000000000005",
  },
};

async function ensureAuthUser({ email, password, fullName }) {
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw listError;

  const existing = listed.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) return existing.id;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw error;
  return data.user.id;
}

async function upsert(table, rows, onConflict = "id") {
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw error;
}

async function run() {
  console.log(`Seeding schema: ${schema}`);

  const adminAuthUid = await ensureAuthUser({
    email: "admin@kompetenzkompass.de",
    password: "ChangeMe!12345",
    fullName: "Demo Admin",
  });
  const managerAuthUid = await ensureAuthUser({
    email: "manager@kompetenzkompass.de",
    password: "ChangeMe!12345",
    fullName: "Petra Manager",
  });
  const userAuthUid = await ensureAuthUser({
    email: "user@kompetenzkompass.de",
    password: "ChangeMe!12345",
    fullName: "Karl Nutzer",
  });

  await upsert("tenants", [
    {
      id: IDS.tenant,
      name: "Kompetenzkompass Demo",
      slug: "demo",
      license_type: "professional",
      max_users: 20,
      max_projects: 50,
    },
  ]);

  await upsert("users", [
    {
      id: IDS.users.admin,
      auth_uid: adminAuthUid,
      email: "admin@kompetenzkompass.de",
      full_name: "Demo Admin",
      phone: "+49 170 1234567",
      phone_verified: true,
      role: "admin",
      status: "active",
      locale: "de",
      tenant_id: IDS.tenant,
      accepted_terms_at: "2026-01-01T00:00:00Z",
      accepted_privacy_at: "2026-01-01T00:00:00Z",
    },
    {
      id: IDS.users.manager,
      auth_uid: managerAuthUid,
      email: "manager@kompetenzkompass.de",
      full_name: "Petra Manager",
      phone: "+49 170 2345678",
      phone_verified: true,
      role: "manager",
      status: "active",
      locale: "de",
      tenant_id: IDS.tenant,
      accepted_terms_at: "2026-02-01T00:00:00Z",
      accepted_privacy_at: "2026-02-01T00:00:00Z",
    },
    {
      id: IDS.users.user,
      auth_uid: userAuthUid,
      email: "user@kompetenzkompass.de",
      full_name: "Karl Nutzer",
      phone: "+49 170 3456789",
      phone_verified: false,
      role: "user",
      status: "active",
      locale: "en",
      tenant_id: IDS.tenant,
      accepted_terms_at: "2026-03-01T00:00:00Z",
      accepted_privacy_at: "2026-03-01T00:00:00Z",
    },
    {
      id: IDS.users.invited,
      auth_uid: null,
      email: "invited@kompetenzkompass.de",
      full_name: "Eingeladener Benutzer",
      phone: null,
      phone_verified: false,
      role: "user",
      status: "invited",
      locale: "de",
      tenant_id: IDS.tenant,
      accepted_terms_at: null,
      accepted_privacy_at: null,
    },
  ]);

  await upsert("licenses", [
    {
      id: "00000000-0000-0000-0002-000000000001",
      tenant_id: IDS.tenant,
      license_type: "professional",
      scope: "user",
      max_units: 20,
      used_units: 4,
      valid_from: "2026-01-01T00:00:00Z",
      valid_until: "2027-01-01T00:00:00Z",
    },
  ]);

  await upsert("projects", [
    {
      id: IDS.projects.p1,
      tenant_id: IDS.tenant,
      title: "Kompetenzkompass MVP Ausschreibung",
      description: "Next.js + TypeScript + Supabase Plattform mit Skill-Matching",
      source_type: "tender",
      raw_text: "Dauer 9 Monate, Branche HR-Tech, Reifegrad Pilot, Projektphase Delivery. Rahmenbedingungen: Remote first, DSGVO, enge Abstimmung mit Fachbereich. Muss: Next.js, React, TypeScript, Architektur, Kommunikation, Scrum, AWS Certified. Kann: Tailwind, Supabase, Testing.",
      status: "active",
      created_by: IDS.users.admin,
      extension_mode: "mock",
      custom_attributes: { compliance_level: "hoch", team_size: "8" },
      duration_months: 9,
      industry: "HR-Tech",
      maturity: "pilot",
      phase: "delivery",
      constraints: ["Remote first", "DSGVO", "Budgetdeckel"],
      additional_attributes: ["Stakeholder-Komplexität", "Reiseanteil"],
    },
    {
      id: IDS.projects.p2,
      tenant_id: IDS.tenant,
      title: "Frontend-Relaunch",
      description: "React + Tailwind Redesign mit Barrierefreiheit",
      source_type: "project-brief",
      raw_text: "Dauer 6 Monate, Branche E-Commerce, Reifegrad Rollout, Projektphase Discovery. Rahmenbedingungen: Hybrid, hoher Zeitdruck. Muss: React, Accessibility, UI-Testing. Kann: TypeScript, Figma.",
      status: "draft",
      created_by: IDS.users.admin,
      extension_mode: "manual-ai-assisted",
      custom_attributes: { target_markets: "DACH, Nordics" },
      duration_months: 6,
      industry: "E-Commerce",
      maturity: "rollout",
      phase: "discovery",
      constraints: ["Hybrid", "Go-live Fixtermin"],
      additional_attributes: ["Barrierefreiheitsniveau"],
    },
    {
      id: IDS.projects.p3,
      tenant_id: IDS.tenant,
      title: "Data-Pipeline Erweiterung",
      description: "Python ETL Pipeline mit PostgreSQL und Redis",
      source_type: "tender",
      raw_text: "Dauer 12 Monate, Branche FinTech, Reifegrad Scale, Projektphase Stabilization. Rahmenbedingungen: On-Prem Security, Audits. Muss: Python, Datenmodellierung, SQL. Kann: Redis, Observability.",
      status: "archived",
      created_by: IDS.users.admin,
      extension_mode: "manual-ai-assisted",
      custom_attributes: { criticality: "tier-1" },
      duration_months: 12,
      industry: "FinTech",
      maturity: "scale",
      phase: "stabilization",
      constraints: ["On-Prem", "Auditpflicht"],
      additional_attributes: ["Bereitschaftsdienst"],
    },
  ]);

  await upsert("candidates", [
    {
      id: IDS.candidates.c1,
      tenant_id: IDS.tenant,
      full_name: "Max Beispiel",
      email: "max@beispiel.de",
      cv_raw_text: "6 Jahre React TypeScript, 4 Jahre Next.js, 2 Jahre Supabase, Scrum, Moderation, AWS Certified.",
      created_by: IDS.users.admin,
      extension_mode: "mock",
      custom_attributes: { travel_readiness: "ja", notice_period: "4 Wochen" },
      location: "Berlin",
      availability_weeks: 4,
      experiences: [{ project_name: "Recruiting Suite", duration_months: 18, role: "Lead Frontend" }],
      total_project_months: 30,
      additional_attributes: ["Branchenfit", "Führungserfahrung"],
    },
    {
      id: IDS.candidates.c2,
      tenant_id: IDS.tenant,
      full_name: "Anna Schmidt",
      email: "anna.schmidt@mail.de",
      cv_raw_text: "5 Jahre Python Django, 3 Jahre Data Science, Teamcoaching, Kommunikation. Professional Scrum Master.",
      created_by: IDS.users.admin,
      extension_mode: "manual-ai-assisted",
      custom_attributes: { willingness_remote: "80%" },
      location: "Hamburg",
      availability_weeks: 8,
      experiences: [{ project_name: "Pricing Engine", duration_months: 16, role: "Backend Engineer" }],
      total_project_months: 26,
      additional_attributes: ["Domain-Wissen Retail"],
    },
    {
      id: IDS.candidates.c3,
      tenant_id: IDS.tenant,
      full_name: "Tom Müller",
      email: "tom.mueller@firma.de",
      cv_raw_text: "8 Jahre Java Spring Boot Microservices, Architektur, Incident-Management, Kommunikation.",
      created_by: IDS.users.admin,
      extension_mode: "manual-ai-assisted",
      custom_attributes: { shift_readiness: "nein" },
      location: "München",
      availability_weeks: 6,
      experiences: [{ project_name: "Core Banking", duration_months: 24, role: "Senior Engineer" }],
      total_project_months: 38,
      additional_attributes: ["Regulatorik-Erfahrung"],
    },
    {
      id: IDS.candidates.c4,
      tenant_id: IDS.tenant,
      full_name: "Lena Weber",
      email: "lena.weber@mail.de",
      cv_raw_text: "4 Jahre React TypeScript, 3 Jahre Next.js, Tailwind, Testing.",
      created_by: IDS.users.admin,
      extension_mode: "mock",
      custom_attributes: { remote_preference: "hybrid" },
      location: "München",
      availability_weeks: 2,
      experiences: [{ project_name: "Shop Portal", duration_months: 20, role: "Frontend Engineer" }],
      total_project_months: 34,
      additional_attributes: ["E-Commerce-Erfahrung"],
    },
    {
      id: IDS.candidates.c5,
      tenant_id: IDS.tenant,
      full_name: "Julia Fischer",
      email: "julia.fischer@mail.de",
      cv_raw_text: "6 Jahre TypeScript React, 4 Jahre Next.js, Architektur, Kommunikation Stakeholder, Scrum, AWS Certified.",
      created_by: IDS.users.admin,
      extension_mode: "mock",
      custom_attributes: { aws_level: "solutions-architect" },
      location: "Berlin",
      availability_weeks: 3,
      experiences: [{ project_name: "HR Platform", duration_months: 24, role: "Lead Engineer" }],
      total_project_months: 44,
      additional_attributes: ["HR-Tech-Erfahrung", "Cloud-Expertise"],
    },
  ]);

  await upsert("project_roles", [
    {
      id: IDS.roles.r1,
      project_id: IDS.projects.p1,
      tenant_id: IDS.tenant,
      title: "Lead Frontend Engineer",
      description: "Verantwortlich für die gesamte Frontend-Architektur und Umsetzung.",
      fill_status: "open",
      assigned_candidate_id: null,
      sort_order: 1,
    },
    {
      id: IDS.roles.r2,
      project_id: IDS.projects.p1,
      tenant_id: IDS.tenant,
      title: "Backend Developer",
      description: "API-Entwicklung und Datenbankintegration mit Supabase.",
      fill_status: "placeholder",
      assigned_candidate_id: null,
      sort_order: 2,
    },
    {
      id: IDS.roles.r3,
      project_id: IDS.projects.p1,
      tenant_id: IDS.tenant,
      title: "QA Engineer",
      description: "Qualitätssicherung und Testautomatisierung.",
      fill_status: "filled",
      assigned_candidate_id: IDS.candidates.c4,
      sort_order: 3,
    },
    {
      id: IDS.roles.r4,
      project_id: IDS.projects.p2,
      tenant_id: IDS.tenant,
      title: "UI/UX Developer",
      description: "Umsetzung des Redesigns mit Fokus auf Barrierefreiheit.",
      fill_status: "open",
      assigned_candidate_id: null,
      sort_order: 1,
    },
    {
      id: IDS.roles.r5,
      project_id: IDS.projects.p3,
      tenant_id: IDS.tenant,
      title: "Data Engineer",
      description: "Aufbau und Betrieb der ETL-Pipeline.",
      fill_status: "open",
      assigned_candidate_id: null,
      sort_order: 1,
    },
  ]);

  await upsert("job_postings", [
    {
      id: IDS.postings.j1,
      project_id: IDS.projects.p1,
      role_id: IDS.roles.r1,
      tenant_id: IDS.tenant,
      title: "Lead Frontend Engineer – Kompetenzkompass MVP",
      description: "Wir suchen einen erfahrenen Frontend-Entwickler mit Fokus auf Next.js und TypeScript.",
      raw_text: "Dauer 9 Monate, Branche HR-Tech, Reifegrad Pilot, Projektphase Delivery. Rahmenbedingungen: Remote first, DSGVO. Muss: Next.js, React, TypeScript, Architektur, Kommunikation, Scrum, AWS Certified.",
      status: "active",
      extension_mode: "mock",
      custom_attributes: { seniority: "senior", team_lead: "ja" },
      created_by: IDS.users.admin,
      duration_months: 9,
      industry: "HR-Tech",
      maturity: "pilot",
      phase: "delivery",
      constraints: ["Remote first", "DSGVO", "Budgetdeckel"],
      additional_attributes: ["Stakeholder-Komplexität", "Reiseanteil"],
    },
    {
      id: IDS.postings.j2,
      project_id: IDS.projects.p1,
      role_id: IDS.roles.r2,
      tenant_id: IDS.tenant,
      title: "Backend Developer – Kompetenzkompass MVP",
      description: "API-Entwicklung mit Supabase und TypeScript, Schwerpunkt Datenmodellierung.",
      raw_text: "Dauer 9 Monate, Branche HR-Tech, Reifegrad Pilot, Projektphase Delivery. Muss: TypeScript, Supabase, Datenmodellierung, SQL, Testing.",
      status: "active",
      extension_mode: "mock",
      custom_attributes: { seniority: "mid-senior" },
      created_by: IDS.users.admin,
      duration_months: 9,
      industry: "HR-Tech",
      maturity: "pilot",
      phase: "delivery",
      constraints: ["Remote first", "DSGVO"],
      additional_attributes: ["Stakeholder-Komplexität"],
    },
    {
      id: IDS.postings.j3,
      project_id: IDS.projects.p2,
      role_id: IDS.roles.r4,
      tenant_id: IDS.tenant,
      title: "UI/UX Developer – Frontend-Relaunch",
      description: "React + Tailwind Redesign mit Fokus auf Barrierefreiheit und Performance.",
      raw_text: "Dauer 6 Monate, Branche E-Commerce, Reifegrad Rollout, Projektphase Discovery. Muss: React, Accessibility, UI-Testing.",
      status: "active",
      extension_mode: "manual-ai-assisted",
      custom_attributes: { focus: "accessibility" },
      created_by: IDS.users.admin,
      duration_months: 6,
      industry: "E-Commerce",
      maturity: "rollout",
      phase: "discovery",
      constraints: ["Hybrid", "Go-live Fixtermin"],
      additional_attributes: ["Barrierefreiheitsniveau"],
    },
    {
      id: IDS.postings.j4,
      project_id: IDS.projects.p3,
      role_id: IDS.roles.r5,
      tenant_id: IDS.tenant,
      title: "Data Engineer – Data-Pipeline Erweiterung",
      description: "Python ETL Pipeline mit PostgreSQL und Redis.",
      raw_text: "Dauer 12 Monate, Branche FinTech, Reifegrad Scale, Projektphase Stabilization. Muss: Python, Datenmodellierung, SQL.",
      status: "closed",
      extension_mode: "manual-ai-assisted",
      custom_attributes: { clearance: "required" },
      created_by: IDS.users.admin,
      duration_months: 12,
      industry: "FinTech",
      maturity: "scale",
      phase: "stabilization",
      constraints: ["On-Prem", "Auditpflicht"],
      additional_attributes: ["Bereitschaftsdienst"],
    },
    {
      id: IDS.postings.j5,
      project_id: IDS.projects.p1,
      role_id: IDS.roles.r3,
      tenant_id: IDS.tenant,
      title: "QA Engineer – Kompetenzkompass MVP",
      description: "Testautomatisierung und Qualitätssicherung für die Matching-Plattform.",
      raw_text: "Dauer 9 Monate, Branche HR-Tech, Reifegrad Pilot, Projektphase Delivery. Muss: Testing, TypeScript, Scrum.",
      status: "filled",
      extension_mode: "mock",
      custom_attributes: {},
      created_by: IDS.users.admin,
      duration_months: 9,
      industry: "HR-Tech",
      maturity: "pilot",
      phase: "delivery",
      constraints: ["Remote first", "DSGVO"],
      additional_attributes: [],
    },
  ]);

  await upsert("match_runs", [
    {
      id: "00000000-0000-0000-0007-000000000001",
      tenant_id: IDS.tenant,
      project_id: IDS.projects.p1,
      posting_id: IDS.postings.j1,
      candidate_id: IDS.candidates.c1,
      score: 87.5,
      summary: "Max Beispiel: Starke Next.js/React-Kompetenz, AWS Certified. Empfehlung: Geeignet.",
    },
    {
      id: "00000000-0000-0000-0007-000000000002",
      tenant_id: IDS.tenant,
      project_id: IDS.projects.p1,
      posting_id: IDS.postings.j1,
      candidate_id: IDS.candidates.c5,
      score: 91.0,
      summary: "Julia Fischer: Sehr gute Passung für Lead-Rolle. Empfehlung: Geeignet.",
    },
  ]);

  console.log("Seed completed successfully.");
  console.log("Demo login: admin@kompetenzkompass.de / ChangeMe!12345");
}

run().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
