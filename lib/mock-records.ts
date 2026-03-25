import type { DbCandidate, DbProject, DbProjectRole, DbJobPosting } from "@/lib/db/types";

export type ProjectMaturity = "idea" | "pilot" | "rollout" | "scale";
export type ProjectPhase = "discovery" | "delivery" | "stabilization";
export type RequirementExtensionMode = "mock" | "manual-ai-assisted";

export interface MockProjectRecord extends DbProject {
  duration_months: number;
  industry: string;
  maturity: ProjectMaturity;
  phase: ProjectPhase;
  constraints: string[];
  additional_attributes: string[];
}

export type MockProjectRoleRecord = DbProjectRole;

export type PostingStatus = "draft" | "active" | "paused" | "closed" | "filled";

export interface MockJobPostingRecord extends DbJobPosting {
  duration_months: number;
  industry: string;
  maturity: ProjectMaturity;
  phase: ProjectPhase;
  constraints: string[];
  additional_attributes: string[];
}

export interface CandidateExperienceEntry {
  project_name: string;
  duration_months: number;
  role: string;
}

export interface MockCandidateRecord extends DbCandidate {
  location: string;
  availability_weeks: number;
  experiences: CandidateExperienceEntry[];
  total_project_months: number;
  additional_attributes: string[];
}

export const MOCK_PROJECTS: MockProjectRecord[] = [
  {
    id: "proj-001",
    tenant_id: "mock-tenant-001",
    title: "Kompetenzkompass MVP Ausschreibung",
    description: "Next.js + TypeScript + Supabase Plattform mit Skill-Matching",
    source_type: "tender",
    raw_text:
      "Dauer 9 Monate, Branche HR-Tech, Reifegrad Pilot, Projektphase Delivery. Rahmenbedingungen: Remote first, DSGVO, enge Abstimmung mit Fachbereich. Muss: Next.js, React, TypeScript, Architektur, Kommunikation, Scrum, AWS Certified. Kann: Tailwind, Supabase, Testing.",
    status: "active",
    created_by: "mock-user-001",
    extension_mode: "mock",
    custom_attributes: { compliance_level: "hoch", team_size: "8" },
    mapped_profile: null,
    created_at: "2026-03-20T10:00:00Z",
    updated_at: "2026-03-20T10:00:00Z",
    duration_months: 9,
    industry: "HR-Tech",
    maturity: "pilot",
    phase: "delivery",
    constraints: ["Remote first", "DSGVO", "Budgetdeckel"],
    additional_attributes: ["Stakeholder-Komplexität", "Reiseanteil"],
  },
  {
    id: "proj-002",
    tenant_id: "mock-tenant-001",
    title: "Frontend-Relaunch",
    description: "React + Tailwind Redesign mit Barrierefreiheit",
    source_type: "project-brief",
    raw_text:
      "Dauer 6 Monate, Branche E-Commerce, Reifegrad Rollout, Projektphase Discovery. Rahmenbedingungen: Hybrid, hoher Zeitdruck. Muss: React, Accessibility, UI-Testing. Kann: TypeScript, Figma.",
    status: "draft",
    created_by: "mock-user-001",
    extension_mode: "manual-ai-assisted",
    custom_attributes: { target_markets: "DACH, Nordics" },
    mapped_profile: null,
    created_at: "2026-03-18T14:00:00Z",
    updated_at: "2026-03-18T14:00:00Z",
    duration_months: 6,
    industry: "E-Commerce",
    maturity: "rollout",
    phase: "discovery",
    constraints: ["Hybrid", "Go-live Fixtermin"],
    additional_attributes: ["Barrierefreiheitsniveau"],
  },
  {
    id: "proj-003",
    tenant_id: "mock-tenant-001",
    title: "Data-Pipeline Erweiterung",
    description: "Python ETL Pipeline mit PostgreSQL und Redis",
    source_type: "tender",
    raw_text:
      "Dauer 12 Monate, Branche FinTech, Reifegrad Scale, Projektphase Stabilization. Rahmenbedingungen: On-Prem Security, Audits. Muss: Python, Datenmodellierung, SQL. Kann: Redis, Observability.",
    status: "archived",
    created_by: "mock-user-001",
    extension_mode: "manual-ai-assisted",
    custom_attributes: { criticality: "tier-1" },
    mapped_profile: null,
    created_at: "2026-02-10T09:00:00Z",
    updated_at: "2026-03-01T09:00:00Z",
    duration_months: 12,
    industry: "FinTech",
    maturity: "scale",
    phase: "stabilization",
    constraints: ["On-Prem", "Auditpflicht"],
    additional_attributes: ["Bereitschaftsdienst"],
  },
];

export const MOCK_CANDIDATES: MockCandidateRecord[] = [
  {
    id: "cand-001",
    tenant_id: "mock-tenant-001",
    full_name: "Max Beispiel",
    email: "max@beispiel.de",
    cv_raw_text:
      "6 Jahre React TypeScript, 4 Jahre Next.js, 2 Jahre Supabase, Scrum, Moderation, AWS Certified. Projekte: Recruiting Suite 18 Monate, Talent API 12 Monate.",
    created_by: "mock-user-001",
    extension_mode: "mock",
    custom_attributes: { travel_readiness: "ja", notice_period: "4 Wochen" },
    mapped_profile: null,
    created_at: "2026-03-19T08:00:00Z",
    location: "Berlin",
    availability_weeks: 4,
    experiences: [
      { project_name: "Recruiting Suite", duration_months: 18, role: "Lead Frontend" },
      { project_name: "Talent API", duration_months: 12, role: "Fullstack Engineer" },
    ],
    total_project_months: 30,
    additional_attributes: ["Branchenfit", "Führungserfahrung"],
  },
  {
    id: "cand-002",
    tenant_id: "mock-tenant-001",
    full_name: "Anna Schmidt",
    email: "anna.schmidt@mail.de",
    cv_raw_text:
      "5 Jahre Python Django, 3 Jahre Data Science, Teamcoaching, Kommunikation. Zertifikate: Professional Scrum Master. Projekte: Pricing Engine 16 Monate, Forecasting 10 Monate.",
    created_by: "mock-user-001",
    extension_mode: "manual-ai-assisted",
    custom_attributes: { willingness_remote: "80%" },
    mapped_profile: null,
    created_at: "2026-03-18T15:00:00Z",
    location: "Hamburg",
    availability_weeks: 8,
    experiences: [
      { project_name: "Pricing Engine", duration_months: 16, role: "Backend Engineer" },
      { project_name: "Forecasting", duration_months: 10, role: "Data Engineer" },
    ],
    total_project_months: 26,
    additional_attributes: ["Domain-Wissen Retail"],
  },
  {
    id: "cand-003",
    tenant_id: "mock-tenant-001",
    full_name: "Tom Müller",
    email: "tom.mueller@firma.de",
    cv_raw_text:
      "8 Jahre Java Spring Boot Microservices, Architektur, Incident-Management, Kommunikation. Zertifikate: ISTQB Foundation. Projekte: Core Banking 24 Monate, Billing 14 Monate.",
    created_by: "mock-user-001",
    extension_mode: "manual-ai-assisted",
    custom_attributes: { shift_readiness: "nein" },
    mapped_profile: null,
    created_at: "2026-03-15T11:00:00Z",
    location: "München",
    availability_weeks: 6,
    experiences: [
      { project_name: "Core Banking", duration_months: 24, role: "Senior Engineer" },
      { project_name: "Billing", duration_months: 14, role: "Tech Lead" },
    ],
    total_project_months: 38,
    additional_attributes: ["Regulatorik-Erfahrung"],
  },
  {
    id: "cand-004",
    tenant_id: "mock-tenant-001",
    full_name: "Lena Weber",
    email: "lena.weber@mail.de",
    cv_raw_text:
      "4 Jahre React TypeScript, 3 Jahre Next.js, Tailwind, Testing. Projekte: Shop Portal 20 Monate, Internal Dashboard 14 Monate.",
    created_by: "mock-user-001",
    extension_mode: "mock",
    custom_attributes: { remote_preference: "hybrid" },
    mapped_profile: null,
    created_at: "2026-03-17T10:00:00Z",
    location: "München",
    availability_weeks: 2,
    experiences: [
      { project_name: "Shop Portal", duration_months: 20, role: "Frontend Engineer" },
      { project_name: "Internal Dashboard", duration_months: 14, role: "UI Developer" },
    ],
    total_project_months: 34,
    additional_attributes: ["E-Commerce-Erfahrung"],
  },
  {
    id: "cand-005",
    tenant_id: "mock-tenant-001",
    full_name: "Felix Hoffmann",
    email: "felix.hoffmann@mail.de",
    cv_raw_text:
      "8 Jahre Architektur System Design, 5 Jahre Java Spring Boot, Kommunikation Stakeholder, Scrum. Projekte: ERP System 36 Monate, API Gateway 18 Monate.",
    created_by: "mock-user-001",
    extension_mode: "manual-ai-assisted",
    custom_attributes: { leadership: "ja" },
    mapped_profile: null,
    created_at: "2026-03-16T10:00:00Z",
    location: "Frankfurt",
    availability_weeks: 12,
    experiences: [
      { project_name: "ERP System", duration_months: 36, role: "Solution Architect" },
      { project_name: "API Gateway", duration_months: 18, role: "Tech Lead" },
    ],
    total_project_months: 54,
    additional_attributes: ["Enterprise-Erfahrung", "Führungserfahrung"],
  },
  {
    id: "cand-006",
    tenant_id: "mock-tenant-001",
    full_name: "Sophie Koch",
    email: "sophie.koch@mail.de",
    cv_raw_text: "2 Jahre React, 1 Jahr Next.js, Supabase. Projekt: Startup App 14 Monate.",
    created_by: "mock-user-001",
    extension_mode: "mock",
    custom_attributes: {},
    mapped_profile: null,
    created_at: "2026-03-15T10:00:00Z",
    location: "Hamburg",
    availability_weeks: 1,
    experiences: [{ project_name: "Startup App", duration_months: 14, role: "Junior Developer" }],
    total_project_months: 14,
    additional_attributes: ["Startup-Erfahrung"],
  },
  {
    id: "cand-007",
    tenant_id: "mock-tenant-001",
    full_name: "Klaus Bauer",
    email: "klaus.bauer@mail.de",
    cv_raw_text:
      "5 Jahre Testing Jest Playwright ui-testing, 3 Jahre TypeScript React, Scrum agile. Projekte: QA Suite 20 Monate, Test Automation 18 Monate.",
    created_by: "mock-user-001",
    extension_mode: "mock",
    custom_attributes: { istqb: "foundation" },
    mapped_profile: null,
    created_at: "2026-03-14T10:00:00Z",
    location: "Remote-DE",
    availability_weeks: 8,
    experiences: [
      { project_name: "QA Suite", duration_months: 20, role: "QA Engineer" },
      { project_name: "Test Automation", duration_months: 18, role: "Senior QA" },
    ],
    total_project_months: 38,
    additional_attributes: ["QA-Expertise"],
  },
  {
    id: "cand-008",
    tenant_id: "mock-tenant-001",
    full_name: "Julia Fischer",
    email: "julia.fischer@mail.de",
    cv_raw_text:
      "6 Jahre TypeScript React, 4 Jahre Next.js, Architektur, Kommunikation Stakeholder, Scrum, AWS Certified. Projekte: HR Platform 24 Monate, Employee Portal 20 Monate.",
    created_by: "mock-user-001",
    extension_mode: "mock",
    custom_attributes: { aws_level: "solutions-architect" },
    mapped_profile: null,
    created_at: "2026-03-13T10:00:00Z",
    location: "Berlin",
    availability_weeks: 3,
    experiences: [
      { project_name: "HR Platform", duration_months: 24, role: "Lead Engineer" },
      { project_name: "Employee Portal", duration_months: 20, role: "Senior Engineer" },
    ],
    total_project_months: 44,
    additional_attributes: ["HR-Tech-Erfahrung", "Cloud-Expertise"],
  },
  {
    id: "cand-009",
    tenant_id: "mock-tenant-001",
    full_name: "Erik Wagner",
    email: "erik.wagner@mail.de",
    cv_raw_text:
      "3 Jahre Tailwind React, 2 Jahre Testing ui-testing. Projekte: Marketing Portal 16 Monate, Landing Suite 10 Monate.",
    created_by: "mock-user-001",
    extension_mode: "manual-ai-assisted",
    custom_attributes: {},
    mapped_profile: null,
    created_at: "2026-03-12T10:00:00Z",
    location: "Leipzig",
    availability_weeks: 6,
    experiences: [
      { project_name: "Marketing Portal", duration_months: 16, role: "Frontend Dev" },
      { project_name: "Landing Suite", duration_months: 10, role: "UI Developer" },
    ],
    total_project_months: 26,
    additional_attributes: ["Marketing-Tech"],
  },
  {
    id: "cand-010",
    tenant_id: "mock-tenant-001",
    full_name: "Nina Schulz",
    email: "nina.schulz@mail.de",
    cv_raw_text:
      "7 Jahre Python, 5 Jahre Architektur System Design, Kommunikation Stakeholder, 3 Jahre Postgres Supabase. Projekte: Analytics Platform 30 Monate, Data Suite 24 Monate.",
    created_by: "mock-user-001",
    extension_mode: "manual-ai-assisted",
    custom_attributes: { domain: "data" },
    mapped_profile: null,
    created_at: "2026-03-11T10:00:00Z",
    location: "Remote-DE",
    availability_weeks: 4,
    experiences: [
      { project_name: "Analytics Platform", duration_months: 30, role: "Data Architect" },
      { project_name: "Data Suite", duration_months: 24, role: "Backend Lead" },
    ],
    total_project_months: 54,
    additional_attributes: ["Data-Engineering", "Cloud-Architektur"],
  },
];

export function getMockProjectById(id: string): MockProjectRecord | undefined {
  return MOCK_PROJECTS.find((project) => project.id === id);
}

export function getMockCandidateById(id: string): MockCandidateRecord | undefined {
  return MOCK_CANDIDATES.find((candidate) => candidate.id === id);
}

// ─── Project Roles ──────────────────────────────────────────────────────────

export const MOCK_PROJECT_ROLES: MockProjectRoleRecord[] = [
  // Roles for proj-001 (Kompetenzkompass MVP)
  {
    id: "role-001",
    project_id: "proj-001",
    tenant_id: "mock-tenant-001",
    title: "Lead Frontend Engineer",
    description: "Verantwortlich für die gesamte Frontend-Architektur und Umsetzung.",
    fill_status: "open",
    assigned_candidate_id: null,
    sort_order: 1,
    created_at: "2026-03-20T10:00:00Z",
    updated_at: "2026-03-20T10:00:00Z",
  },
  {
    id: "role-002",
    project_id: "proj-001",
    tenant_id: "mock-tenant-001",
    title: "Backend Developer",
    description: "API-Entwicklung und Datenbankintegration mit Supabase.",
    fill_status: "placeholder",
    assigned_candidate_id: null,
    sort_order: 2,
    created_at: "2026-03-20T10:00:00Z",
    updated_at: "2026-03-20T10:00:00Z",
  },
  {
    id: "role-003",
    project_id: "proj-001",
    tenant_id: "mock-tenant-001",
    title: "QA Engineer",
    description: "Qualitätssicherung und Testautomatisierung.",
    fill_status: "filled",
    assigned_candidate_id: "cand-007",
    sort_order: 3,
    created_at: "2026-03-20T10:00:00Z",
    updated_at: "2026-03-21T08:00:00Z",
  },
  // Roles for proj-002 (Frontend-Relaunch)
  {
    id: "role-004",
    project_id: "proj-002",
    tenant_id: "mock-tenant-001",
    title: "UI/UX Developer",
    description: "Umsetzung des Redesigns mit Fokus auf Barrierefreiheit.",
    fill_status: "open",
    assigned_candidate_id: null,
    sort_order: 1,
    created_at: "2026-03-18T14:00:00Z",
    updated_at: "2026-03-18T14:00:00Z",
  },
  // Roles for proj-003 (Data-Pipeline)
  {
    id: "role-005",
    project_id: "proj-003",
    tenant_id: "mock-tenant-001",
    title: "Data Engineer",
    description: "Aufbau und Betrieb der ETL-Pipeline.",
    fill_status: "open",
    assigned_candidate_id: null,
    sort_order: 1,
    created_at: "2026-02-10T09:00:00Z",
    updated_at: "2026-02-10T09:00:00Z",
  },
];

// ─── Job Postings (Ausschreibungen) ─────────────────────────────────────────

export const MOCK_JOB_POSTINGS: MockJobPostingRecord[] = [
  {
    id: "posting-001",
    project_id: "proj-001",
    role_id: "role-001",
    tenant_id: "mock-tenant-001",
    title: "Lead Frontend Engineer – Kompetenzkompass MVP",
    description: "Wir suchen einen erfahrenen Frontend-Entwickler mit Fokus auf Next.js und TypeScript.",
    raw_text:
      "Dauer 9 Monate, Branche HR-Tech, Reifegrad Pilot, Projektphase Delivery. Rahmenbedingungen: Remote first, DSGVO, enge Abstimmung mit Fachbereich. Muss: Next.js, React, TypeScript, Architektur, Kommunikation, Scrum, AWS Certified. Kann: Tailwind, Supabase, Testing.",
    status: "active",
    extension_mode: "mock",
    custom_attributes: { seniority: "senior", team_lead: "ja" },
    mapped_profile: null,
    created_by: "mock-user-001",
    created_at: "2026-03-20T10:30:00Z",
    updated_at: "2026-03-20T10:30:00Z",
    duration_months: 9,
    industry: "HR-Tech",
    maturity: "pilot",
    phase: "delivery",
    constraints: ["Remote first", "DSGVO", "Budgetdeckel"],
    additional_attributes: ["Stakeholder-Komplexität", "Reiseanteil"],
  },
  {
    id: "posting-002",
    project_id: "proj-001",
    role_id: "role-002",
    tenant_id: "mock-tenant-001",
    title: "Backend Developer – Kompetenzkompass MVP",
    description: "API-Entwicklung mit Supabase und TypeScript, Schwerpunkt Datenmodellierung.",
    raw_text:
      "Dauer 9 Monate, Branche HR-Tech, Reifegrad Pilot, Projektphase Delivery. Rahmenbedingungen: Remote first, DSGVO. Muss: TypeScript, Supabase, Datenmodellierung, SQL, Testing. Kann: Next.js, Redis, Observability.",
    status: "active",
    extension_mode: "mock",
    custom_attributes: { seniority: "mid-senior" },
    mapped_profile: null,
    created_by: "mock-user-001",
    created_at: "2026-03-20T11:00:00Z",
    updated_at: "2026-03-20T11:00:00Z",
    duration_months: 9,
    industry: "HR-Tech",
    maturity: "pilot",
    phase: "delivery",
    constraints: ["Remote first", "DSGVO"],
    additional_attributes: ["Stakeholder-Komplexität"],
  },
  {
    id: "posting-003",
    project_id: "proj-002",
    role_id: "role-004",
    tenant_id: "mock-tenant-001",
    title: "UI/UX Developer – Frontend-Relaunch",
    description: "React + Tailwind Redesign mit Fokus auf Barrierefreiheit und Performance.",
    raw_text:
      "Dauer 6 Monate, Branche E-Commerce, Reifegrad Rollout, Projektphase Discovery. Rahmenbedingungen: Hybrid, hoher Zeitdruck. Muss: React, Accessibility, UI-Testing. Kann: TypeScript, Figma.",
    status: "active",
    extension_mode: "manual-ai-assisted",
    custom_attributes: { focus: "accessibility" },
    mapped_profile: null,
    created_by: "mock-user-001",
    created_at: "2026-03-18T14:30:00Z",
    updated_at: "2026-03-18T14:30:00Z",
    duration_months: 6,
    industry: "E-Commerce",
    maturity: "rollout",
    phase: "discovery",
    constraints: ["Hybrid", "Go-live Fixtermin"],
    additional_attributes: ["Barrierefreiheitsniveau"],
  },
  {
    id: "posting-004",
    project_id: "proj-003",
    role_id: "role-005",
    tenant_id: "mock-tenant-001",
    title: "Data Engineer – Data-Pipeline Erweiterung",
    description: "Python ETL Pipeline mit PostgreSQL und Redis.",
    raw_text:
      "Dauer 12 Monate, Branche FinTech, Reifegrad Scale, Projektphase Stabilization. Rahmenbedingungen: On-Prem Security, Audits. Muss: Python, Datenmodellierung, SQL. Kann: Redis, Observability.",
    status: "closed",
    extension_mode: "manual-ai-assisted",
    custom_attributes: { clearance: "required" },
    mapped_profile: null,
    created_by: "mock-user-001",
    created_at: "2026-02-10T09:30:00Z",
    updated_at: "2026-03-15T09:00:00Z",
    duration_months: 12,
    industry: "FinTech",
    maturity: "scale",
    phase: "stabilization",
    constraints: ["On-Prem", "Auditpflicht"],
    additional_attributes: ["Bereitschaftsdienst"],
  },
  {
    id: "posting-005",
    project_id: "proj-001",
    role_id: "role-003",
    tenant_id: "mock-tenant-001",
    title: "QA Engineer – Kompetenzkompass MVP",
    description: "Testautomatisierung und Qualitätssicherung für die Matching-Plattform.",
    raw_text:
      "Dauer 9 Monate, Branche HR-Tech, Reifegrad Pilot, Projektphase Delivery. Rahmenbedingungen: Remote first, DSGVO. Muss: Testing, TypeScript, Scrum. Kann: Playwright, Jest.",
    status: "filled",
    extension_mode: "mock",
    custom_attributes: {},
    mapped_profile: null,
    created_by: "mock-user-001",
    created_at: "2026-03-20T11:30:00Z",
    updated_at: "2026-03-21T08:00:00Z",
    duration_months: 9,
    industry: "HR-Tech",
    maturity: "pilot",
    phase: "delivery",
    constraints: ["Remote first", "DSGVO"],
    additional_attributes: [],
  },
];

export function getMockRolesForProject(projectId: string): MockProjectRoleRecord[] {
  return MOCK_PROJECT_ROLES.filter((role) => role.project_id === projectId);
}

export function getMockRoleById(id: string): MockProjectRoleRecord | undefined {
  return MOCK_PROJECT_ROLES.find((role) => role.id === id);
}

export function getMockPostingsForProject(projectId: string): MockJobPostingRecord[] {
  return MOCK_JOB_POSTINGS.filter((posting) => posting.project_id === projectId);
}

export function getMockPostingsForRole(roleId: string): MockJobPostingRecord[] {
  return MOCK_JOB_POSTINGS.filter((posting) => posting.role_id === roleId);
}

export function getMockPostingById(id: string): MockJobPostingRecord | undefined {
  return MOCK_JOB_POSTINGS.find((posting) => posting.id === id);
}

export function getActivePostings(): MockJobPostingRecord[] {
  return MOCK_JOB_POSTINGS.filter((posting) => posting.status === "active");
}
