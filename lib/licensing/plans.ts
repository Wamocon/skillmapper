import type { LicenseType } from "@/lib/db/types";

export interface LicensePlan {
  type: LicenseType;
  nameKey: string;
  maxUsers: number;
  maxProjects: number;
  priceMonthly: number; // EUR cents
  features: string[];
}

export const LICENSE_PLANS: LicensePlan[] = [
  {
    type: "free",
    nameKey: "licensing.free",
    maxUsers: 1,
    maxProjects: 2,
    priceMonthly: 0,
    features: ["basic_matching", "manual_upload"],
  },
  {
    type: "starter",
    nameKey: "licensing.starter",
    maxUsers: 5,
    maxProjects: 10,
    priceMonthly: 2900,
    features: ["basic_matching", "manual_upload", "interview_analysis", "export"],
  },
  {
    type: "professional",
    nameKey: "licensing.professional",
    maxUsers: 25,
    maxProjects: 50,
    priceMonthly: 9900,
    features: ["basic_matching", "manual_upload", "interview_analysis", "export", "api_access", "priority_support"],
  },
  {
    type: "enterprise",
    nameKey: "licensing.enterprise",
    maxUsers: -1, // unlimited
    maxProjects: -1,
    priceMonthly: -1, // custom pricing
    features: ["basic_matching", "manual_upload", "interview_analysis", "export", "api_access", "priority_support", "sso", "custom_integrations"],
  },
];

export function getPlan(type: LicenseType): LicensePlan {
  return LICENSE_PLANS.find((p) => p.type === type) ?? LICENSE_PLANS[0];
}

export function canAddUser(plan: LicensePlan, currentUsers: number): boolean {
  if (plan.maxUsers === -1) return true;
  return currentUsers < plan.maxUsers;
}

export function canAddProject(plan: LicensePlan, currentProjects: number): boolean {
  if (plan.maxProjects === -1) return true;
  return currentProjects < plan.maxProjects;
}

export function formatPrice(cents: number, locale: "de" | "en"): string {
  if (cents === -1) return locale === "de" ? "Auf Anfrage" : "Contact us";
  if (cents === 0) return locale === "de" ? "Kostenlos" : "Free";
  const euros = cents / 100;
  return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
    style: "currency",
    currency: "EUR",
  }).format(euros);
}
