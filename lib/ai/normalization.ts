const SKILL_ALIASES: Record<string, string> = {
  "nextjs": "next.js",
  "next js": "next.js",
  "next.js": "next.js",
  "reactjs": "react",
  "react.js": "react",
  "react": "react",
  "typescript": "typescript",
  "type script": "typescript",
  "ts": "typescript",
  "javascript": "javascript",
  "java script": "javascript",
  "js": "javascript",
  "tailwind": "tailwindcss",
  "tailwindcss": "tailwindcss",
  "postgres": "postgresql",
  "postgresql": "postgresql",
  "postgre sql": "postgresql",
  "k8s": "kubernetes",
  "kubernetes": "kubernetes",
  "scrum master": "professional scrum master",
  "psm": "professional scrum master",
  "aws cert": "aws certified",
  "aws certification": "aws certified",
  "aws certified": "aws certified",
  "system design": "architecture",
  "architektur": "architecture",
};

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function stripQuotes(value: string): string {
  return value.replace(/^["'`]+|["'`]+$/g, "");
}

function normalizeToken(value: string): string {
  return normalizeWhitespace(
    stripQuotes(value)
      .toLowerCase()
      .replace(/[()\[\]{}]/g, " ")
      .replace(/[_,;:]+/g, " ")
      .replace(/\s*\/\s*/g, " ")
      .replace(/\s*-\s*/g, "-")
      .replace(/\.+/g, "."),
  );
}

export function normalizeSkillName(value: string): string {
  const token = normalizeToken(value);
  if (!token) return "";
  return SKILL_ALIASES[token] ?? token;
}

export function normalizeFreeText(value: unknown): string {
  return typeof value === "string" ? normalizeWhitespace(stripQuotes(value)) : "";
}

export function normalizeStringArray(value: unknown, maxItems = 50): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const items: string[] = [];

  for (const entry of value) {
    const normalized = normalizeFreeText(entry);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(normalized);
    if (items.length >= maxItems) break;
  }

  return items;
}

export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, value));
}

export function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function normalizeCategory(value: unknown): "tool" | "hard" | "soft" | "certification" {
  const normalized = normalizeToken(String(value ?? ""));
  if (normalized === "tool" || normalized === "tools") return "tool";
  if (normalized === "soft" || normalized === "soft skill" || normalized === "soft skills") return "soft";
  if (normalized === "certification" || normalized === "certificate" || normalized === "zertifikat") {
    return "certification";
  }
  return "hard";
}

export function normalizeRequirementType(value: unknown): "must" | "can" {
  const normalized = normalizeToken(String(value ?? ""));
  return normalized === "must" || normalized === "required" || normalized === "pflicht" ? "must" : "can";
}

export function normalizeRecommendation(value: unknown): "geeignet" | "bedingt geeignet" | "nicht geeignet" {
  const normalized = normalizeToken(String(value ?? ""));
  if (normalized === "geeignet" || normalized === "suitable") return "geeignet";
  if (normalized === "bedingt geeignet" || normalized === "partial" || normalized === "partially suitable") {
    return "bedingt geeignet";
  }
  return "nicht geeignet";
}

export function normalizePriority(value: unknown): "high" | "medium" | "low" {
  const normalized = normalizeToken(String(value ?? ""));
  if (normalized === "high") return "high";
  if (normalized === "low") return "low";
  return "medium";
}

export function normalizeInterviewCategory(value: unknown): "technical" | "behavioral" | "motivational" | "contextual" {
  const normalized = normalizeToken(String(value ?? ""));
  if (normalized === "behavioral") return "behavioral";
  if (normalized === "motivational") return "motivational";
  if (normalized === "contextual") return "contextual";
  return "technical";
}

export function normalizeMaturity(value: unknown): "idea" | "pilot" | "rollout" | "scale" {
  const normalized = normalizeToken(String(value ?? ""));
  if (normalized === "pilot") return "pilot";
  if (normalized === "rollout") return "rollout";
  if (normalized === "scale") return "scale";
  return "idea";
}

export function normalizePhase(value: unknown): "discovery" | "delivery" | "stabilization" {
  const normalized = normalizeToken(String(value ?? ""));
  if (normalized === "delivery") return "delivery";
  if (normalized === "stabilization" || normalized === "stabilisation") return "stabilization";
  return "discovery";
}

export function dedupeByKey<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  const deduped: T[] = [];

  for (const item of items) {
    const key = getKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  return deduped;
}
