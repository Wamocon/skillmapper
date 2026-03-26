export type SkillCategory = "tool" | "hard" | "soft" | "certification";

export type RequirementType = "must" | "can";

export type Requirement = {
  id: string;
  name: string;
  category: SkillCategory;
  mustHave: boolean;
  requirementType: RequirementType;
  targetLevel: number;
  weight: number;
  evidence: string;
};

export type CandidateSkill = {
  id: string;
  name: string;
  category: SkillCategory;
  level: number;
  years: number;
  evidence: string;
};

export type MappingResult = {
  sourceLabel: string;
  sourceType: "project" | "candidate";
  mocked: boolean;
  extractedCount: number;
};

export type MatchDetail = {
  requirement: Requirement;
  status: "matched" | "partial" | "gap";
  scoreContribution: number;
  matchedSkill?: CandidateSkill;
  levelDelta?: number; // candidate level minus target level
};

export type ScoreReason = {
  key: string;
  title: string;
  detail: string;
  impact: "positive" | "neutral" | "negative";
};

export type MatchResult = {
  mocked: boolean;
  totalScore: number;
  recommendation: "geeignet" | "bedingt geeignet" | "nicht geeignet";
  overlaps: string[];
  gaps: string[];
  details: MatchDetail[];
  scoreReasons: ScoreReason[];
};

export type InterviewQuestion = {
  id: string;
  question: string;
  goal: string;
  expectedEvidence: string;
  basedOn: string;
};

export type InterviewFinding = {
  id: string;
  claim: string;
  status: "bestatigt" | "teilweise" | "nicht belegt";
  note: string;
};

export type ExtensionMode = "mock" | "manual-ai-assisted";

export type ProjectHeader = {
  durationMonths: number;
  industry: string;
  maturityLevel: "idea" | "pilot" | "rollout" | "scale";
  projectPhase: "discovery" | "delivery" | "stabilization";
  conditions: string[];
};

export type CandidateHeader = {
  location: string;
  availabilityWeeks: number;
  totalProjectMonths: number;
  totalExperienceYears: number;
};

export type AttributeExtension = {
  name: string;
  value: string;
  source: "manual" | "ai-assisted" | "mock";
};

export type ProjectAnalysis = {
  mapping: MappingResult;
  header: ProjectHeader;
  requirements: Requirement[];
  additionalAttributes: string[];
  extensionMode: ExtensionMode;
  extensionAttributes: AttributeExtension[];
};

export type PostingAnalysis = ProjectAnalysis & {
  postingLabel: string;
  roleTitle: string;
};

export type CandidateProfile = {
  mapping: MappingResult;
  header: CandidateHeader;
  hardSkills: CandidateSkill[];
  softSkills: CandidateSkill[];
  toolSkills: CandidateSkill[];
  certifications: CandidateSkill[];
  additionalAttributes: string[];
  extensionMode: ExtensionMode;
  extensionAttributes: AttributeExtension[];
};

type SkillRule = {
  key: string;
  aliases: string[];
  category: SkillCategory;
  requirementTypeDefault: RequirementType;
  targetLevelDefault: number;
  weightDefault: number;
};

const SKILL_RULES: SkillRule[] = [
  {
    key: "next.js",
    aliases: ["next.js", "nextjs"],
    category: "tool",
    requirementTypeDefault: "must",
    targetLevelDefault: 8,
    weightDefault: 18,
  },
  {
    key: "react",
    aliases: ["react"],
    category: "hard",
    requirementTypeDefault: "must",
    targetLevelDefault: 8,
    weightDefault: 15,
  },
  {
    key: "typescript",
    aliases: ["typescript", "ts"],
    category: "hard",
    requirementTypeDefault: "must",
    targetLevelDefault: 8,
    weightDefault: 15,
  },
  {
    key: "tailwind",
    aliases: ["tailwind", "tailwindcss"],
    category: "tool",
    requirementTypeDefault: "can",
    targetLevelDefault: 6,
    weightDefault: 8,
  },
  {
    key: "supabase",
    aliases: ["supabase", "postgres"],
    category: "tool",
    requirementTypeDefault: "can",
    targetLevelDefault: 6,
    weightDefault: 10,
  },
  {
    key: "architektur",
    aliases: ["architektur", "architecture", "system design"],
    category: "hard",
    requirementTypeDefault: "must",
    targetLevelDefault: 7,
    weightDefault: 12,
  },
  {
    key: "testing",
    aliases: ["test", "testing", "jest", "playwright", "ui-testing"],
    category: "hard",
    requirementTypeDefault: "can",
    targetLevelDefault: 6,
    weightDefault: 8,
  },
  {
    key: "kommunikation",
    aliases: ["kommunikation", "moderation", "stakeholder"],
    category: "soft",
    requirementTypeDefault: "must",
    targetLevelDefault: 7,
    weightDefault: 10,
  },
  {
    key: "agile",
    aliases: ["agile", "scrum", "kanban"],
    category: "soft",
    requirementTypeDefault: "can",
    targetLevelDefault: 6,
    weightDefault: 7,
  },
  {
    key: "aws certified",
    aliases: ["aws certified", "aws certification"],
    category: "certification",
    requirementTypeDefault: "can",
    targetLevelDefault: 5,
    weightDefault: 6,
  },
  {
    key: "professional scrum master",
    aliases: ["professional scrum master", "psm", "scrum master"],
    category: "certification",
    requirementTypeDefault: "can",
    targetLevelDefault: 5,
    weightDefault: 6,
  },
];

const FALLBACK_REQUIREMENTS: Requirement[] = [
  {
    id: "req-fallback-1",
    name: "anforderungsanalyse",
    category: "hard",
    mustHave: true,
    requirementType: "must",
    targetLevel: 7,
    weight: 20,
    evidence: "Fallback-Mapping, weil im Text keine klaren Tech-Keywords erkannt wurden.",
  },
  {
    id: "req-fallback-2",
    name: "stakeholder-kommunikation",
    category: "soft",
    mustHave: false,
    requirementType: "can",
    targetLevel: 6,
    weight: 12,
    evidence: "Fallback-Mapping aus Projektkontext angenommen.",
  },
];

function textIncludesAny(text: string, aliases: string[]): boolean {
  return aliases.some((alias) => text.includes(alias));
}

function normalized(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function clampScale(level: number): number {
  return Math.max(1, Math.min(10, Math.round(level)));
}

function estimateYears(text: string, aliases: string[]): number {
  const yearRegex = /(\d{1,2})\s*(jahre|years|jahr)/g;
  const matches = [...text.matchAll(yearRegex)];

  if (!matches.length) {
    return textIncludesAny(text, aliases) ? 2 : 0;
  }

  const maxYears = Math.max(...matches.map((match) => Number(match[1])));
  return Number.isFinite(maxYears) ? maxYears : 0;
}

function levelFromYears(years: number): number {
  if (years >= 8) return 10;
  if (years >= 6) return 9;
  if (years >= 4) return 8;
  if (years >= 3) return 7;
  if (years >= 2) return 6;
  return 4;
}

function parseDurationMonths(text: string): number {
  const monthMatch = text.match(/(\d{1,2})\s*(monat|monate|months)/);
  if (monthMatch?.[1]) return Number(monthMatch[1]);

  const yearMatch = text.match(/(\d{1,2})\s*(jahr|jahre|year|years)/);
  if (yearMatch?.[1]) return Number(yearMatch[1]) * 12;

  return 6;
}

function parseIndustry(text: string): string {
  if (text.includes("hr-tech") || text.includes("recruiting")) return "HR-Tech";
  if (text.includes("fintech") || text.includes("banking")) return "FinTech";
  if (text.includes("e-commerce") || text.includes("retail")) return "E-Commerce";
  return "Allgemein";
}

function parseMaturity(text: string): ProjectHeader["maturityLevel"] {
  if (text.includes("scale")) return "scale";
  if (text.includes("rollout")) return "rollout";
  if (text.includes("pilot")) return "pilot";
  return "idea";
}

function parsePhase(text: string): ProjectHeader["projectPhase"] {
  if (text.includes("stabilization") || text.includes("stabilisierung")) return "stabilization";
  if (text.includes("delivery") || text.includes("umsetzung")) return "delivery";
  return "discovery";
}

function deriveConditions(text: string): string[] {
  const knownConditions = ["remote", "hybrid", "dsgvo", "on-prem", "audit", "budget", "zeitdruck"];
  const found = knownConditions.filter((condition) => text.includes(condition));
  if (!found.length) {
    return ["Standard-Rahmenbedingungen", "Abstimmung mit Fachbereich"];
  }

  return found.map((item) => item.replace("dsgvo", "DSGVO").replace("on-prem", "On-Prem"));
}

function buildProjectRequirements(text: string): Requirement[] {
  const requirements = SKILL_RULES.filter((rule) => textIncludesAny(text, rule.aliases)).map((rule, idx) => ({
    id: `req-${idx + 1}`,
    name: rule.key,
    category: rule.category,
    mustHave: rule.requirementTypeDefault === "must",
    requirementType: rule.requirementTypeDefault,
    targetLevel: rule.targetLevelDefault,
    weight: rule.weightDefault,
    evidence: `MOCK: aus Keywords ${rule.aliases.join(", ")} im Projekttext abgeleitet.`,
  }));

  return requirements.length ? requirements : FALLBACK_REQUIREMENTS;
}

export function analyzeProject(projectTitle: string, projectText: string, extensionMode: ExtensionMode = "mock"): ProjectAnalysis {
  const text = normalized(`${projectTitle} ${projectText}`);
  const requirements = buildProjectRequirements(text);

  const extensionAttributes: AttributeExtension[] = [
    {
      name: "compliance_level",
      value: text.includes("dsgvo") ? "hoch" : "mittel",
      source: extensionMode === "mock" ? "mock" : "ai-assisted",
    },
    {
      name: "stakeholder_anzahl",
      value: text.includes("fachbereich") ? "3" : "2",
      source: extensionMode === "mock" ? "mock" : "manual",
    },
  ];

  return {
    mapping: {
      sourceLabel: projectTitle || "Unbenanntes Projekt",
      sourceType: "project",
      mocked: true,
      extractedCount: requirements.length,
    },
    header: {
      durationMonths: parseDurationMonths(text),
      industry: parseIndustry(text),
      maturityLevel: parseMaturity(text),
      projectPhase: parsePhase(text),
      conditions: deriveConditions(text),
    },
    requirements,
    additionalAttributes: [
      "Budgetrahmen",
      "Stakeholder-Komplexität",
      "Sprachanforderung",
      "Einsatzort",
      "Reiseanteil",
    ],
    extensionMode,
    extensionAttributes,
  };
}

function buildCandidateSkills(text: string): CandidateSkill[] {
  const skills = SKILL_RULES.filter((rule) => textIncludesAny(text, rule.aliases)).map((rule, idx) => {
    const years = Math.max(estimateYears(text, rule.aliases), 1);
    const level = clampScale(levelFromYears(years) + (rule.category === "soft" ? 1 : 0));

    return {
      id: `skill-${idx + 1}`,
      name: rule.key,
      category: rule.category,
      years,
      level,
      evidence: `MOCK: Skill im CV-Text per Alias ${rule.aliases.join(", ")} erkannt.`,
    };
  });

  return skills.length
    ? skills
    : [
        {
          id: "skill-fallback-1",
          name: "kommunikation",
          category: "soft",
          level: 6,
          years: 3,
          evidence: "MOCK: Fallback-Skill, da keine technischen Begriffe erkannt wurden.",
        },
      ];
}

function estimateTotalProjectMonths(text: string): number {
  const months = [...text.matchAll(/(\d{1,2})\s*(monat|monate|months)/g)].map((match) => Number(match[1]));
  if (months.length > 0) {
    return months.reduce((sum, current) => sum + current, 0);
  }

  const years = [...text.matchAll(/(\d{1,2})\s*(jahr|jahre|years|year)/g)].map((match) => Number(match[1]));
  if (years.length > 0) {
    return years.reduce((sum, current) => sum + current * 12, 0);
  }

  return 24;
}

export function analyzePosting(
  postingTitle: string,
  postingText: string,
  roleTitle: string,
  extensionMode: ExtensionMode = "mock",
): PostingAnalysis {
  const base = analyzeProject(postingTitle, postingText, extensionMode);
  return {
    ...base,
    mapping: {
      ...base.mapping,
      sourceLabel: postingTitle || "Unbenannte Ausschreibung",
    },
    postingLabel: postingTitle,
    roleTitle,
  };
}

export function analyzeCandidate(candidateName: string, candidateText: string, extensionMode: ExtensionMode = "mock"): CandidateProfile {
  const text = normalized(candidateText);
  const skills = buildCandidateSkills(text);
  const totalProjectMonths = estimateTotalProjectMonths(text);

  const extensionAttributes: AttributeExtension[] = [
    {
      name: "remote_quote",
      value: text.includes("remote") ? "hoch" : "mittel",
      source: extensionMode === "mock" ? "mock" : "manual",
    },
    {
      name: "domain_fit",
      value: text.includes("hr") || text.includes("recruiting") ? "hoch" : "mittel",
      source: extensionMode === "mock" ? "mock" : "ai-assisted",
    },
  ];

  const byCategory = (category: SkillCategory) => skills.filter((skill) => skill.category === category);

  return {
    mapping: {
      sourceLabel: candidateName || "Unbekannter Kandidat",
      sourceType: "candidate",
      mocked: true,
      extractedCount: skills.length,
    },
    header: {
      location: text.includes("berlin") ? "Berlin" : text.includes("hamburg") ? "Hamburg" : "Remote-DE",
      availabilityWeeks: text.includes("ab sofort") ? 1 : 4,
      totalProjectMonths,
      totalExperienceYears: Number((totalProjectMonths / 12).toFixed(1)),
    },
    hardSkills: byCategory("hard"),
    softSkills: byCategory("soft"),
    toolSkills: byCategory("tool"),
    certifications: byCategory("certification"),
    additionalAttributes: [
      "Gehaltsband",
      "Mobilität",
      "Sprachlevel",
      "Führungsspanne",
      "Branchenfit",
      "Verfügbarkeit",
    ],
    extensionMode,
    extensionAttributes,
  };
}

export function mapProjectRequirements(projectTitle: string, projectText: string): {
  mapping: MappingResult;
  requirements: Requirement[];
} {
  const project = analyzeProject(projectTitle, projectText);
  return {
    mapping: project.mapping,
    requirements: project.requirements,
  };
}

export function mapCandidateSkills(candidateName: string, candidateText: string): {
  mapping: MappingResult;
  skills: CandidateSkill[];
} {
  const candidate = analyzeCandidate(candidateName, candidateText);
  const effectiveSkills = [
    ...candidate.hardSkills,
    ...candidate.softSkills,
    ...candidate.toolSkills,
    ...candidate.certifications,
  ];

  return {
    mapping: candidate.mapping,
    skills: effectiveSkills,
  };
}

export function calculateMatch(requirements: Requirement[], skills: CandidateSkill[]): MatchResult {
  let totalWeight = 0;
  let achievedWeight = 0;

  const overlaps: string[] = [];
  const gaps: string[] = [];

  const details: MatchDetail[] = requirements.map((req) => {
    totalWeight += req.weight;

    const exact = skills.find((skill) => skill.name === req.name);
    const soft =
      exact ||
      skills.find(
        (skill) =>
          skill.name.includes(req.name) || req.name.includes(skill.name) || (req.category === "soft" && skill.name === "kommunikation"),
      );

    if (!soft) {
      gaps.push(req.name);
      return {
        requirement: req,
        status: "gap",
        scoreContribution: 0,
        levelDelta: -(req.targetLevel),
      };
    }

    const ratio = Math.min(1.1, soft.level / req.targetLevel);
    const multiplier = ratio >= 1 ? 1 : ratio >= 0.75 ? 0.7 : 0.45;

    const contribution = Math.round(req.weight * multiplier);
    achievedWeight += contribution;
    const levelDelta = soft.level - req.targetLevel;

    if (exact && ratio >= 0.9) {
      overlaps.push(req.name);
      return {
        requirement: req,
        status: "matched",
        scoreContribution: contribution,
        matchedSkill: soft,
        levelDelta,
      };
    }

    overlaps.push(`${req.name} (teilweise)`);
    return {
      requirement: req,
      status: "partial",
      scoreContribution: contribution,
      matchedSkill: soft,
      levelDelta,
    };
  });

  const totalScore = totalWeight > 0 ? Math.min(100, Math.round((achievedWeight / totalWeight) * 100)) : 0;
  const mustHaveGaps = details.filter((item) => item.requirement.mustHave && item.status === "gap").length;

  const recommendation: MatchResult["recommendation"] =
    totalScore >= 75 && mustHaveGaps === 0 ? "geeignet" : totalScore >= 50 ? "bedingt geeignet" : "nicht geeignet";

  // ── Score justification (human-readable reasons) ──────────────────────────
  const scoreReasons: ScoreReason[] = [];

  // 1. Overall score explanation
  scoreReasons.push({
    key: "score-total",
    title: `Gesamtscore: ${totalScore}% (${achievedWeight}/${totalWeight} gewichtete Punkte)`,
    detail: `Der Score ergibt sich aus ${requirements.length} Anforderungen mit unterschiedlicher Gewichtung. Jede Anforderung trägt proportional zu ihrem Gewicht und dem erreichten Level-Verhältnis bei.`,
    impact: totalScore >= 75 ? "positive" : totalScore >= 50 ? "neutral" : "negative",
  });

  // 2. Critical must-have gaps
  const criticalGaps = details.filter((d) => d.requirement.mustHave && d.status === "gap");
  if (criticalGaps.length > 0) {
    scoreReasons.push({
      key: "critical-gaps",
      title: `${criticalGaps.length} Pflichtanforderung${criticalGaps.length > 1 ? "en" : ""} nicht erfüllt`,
      detail: criticalGaps
        .map((d) => `${d.requirement.name} (Ziel: Level ${d.requirement.targetLevel}, Gewicht: ${d.requirement.weight})`)
        .join(" · "),
      impact: "negative",
    });
  }

  // 3. Fully matched requirements
  const matched = details.filter((d) => d.status === "matched");
  if (matched.length > 0) {
    scoreReasons.push({
      key: "matched-skills",
      title: `${matched.length} Anforderung${matched.length > 1 ? "en" : ""} vollständig erfüllt`,
      detail: matched
        .map((d) => `${d.requirement.name}: Level ${d.matchedSkill!.level}/${d.requirement.targetLevel}${d.levelDelta && d.levelDelta > 0 ? ` (+${d.levelDelta})` : ""}`)
        .join(" · "),
      impact: "positive",
    });
  }

  // 4. Partial matches with level deviation
  const partials = details.filter((d) => d.status === "partial");
  if (partials.length > 0) {
    scoreReasons.push({
      key: "partial-skills",
      title: `${partials.length} Anforderung${partials.length > 1 ? "en" : ""} teilweise erfüllt`,
      detail: partials
        .map((d) => `${d.requirement.name}: Level ${d.matchedSkill?.level ?? 0}/${d.requirement.targetLevel} (Abweichung: ${d.levelDelta ?? 0})`)
        .join(" · "),
      impact: "neutral",
    });
  }

  // 5. Optional gaps
  const optionalGaps = details.filter((d) => !d.requirement.mustHave && d.status === "gap");
  if (optionalGaps.length > 0) {
    scoreReasons.push({
      key: "optional-gaps",
      title: `${optionalGaps.length} optionale Anforderung${optionalGaps.length > 1 ? "en" : ""} fehlen`,
      detail: optionalGaps.map((d) => `${d.requirement.name} (Gewicht: ${d.requirement.weight})`).join(" · "),
      impact: "neutral",
    });
  }

  // 6. Individual detail reasons (for per-skill breakdown)
  for (const d of details) {
    if (d.status === "matched") {
      scoreReasons.push({
        key: `detail-${d.requirement.id}`,
        title: `${d.requirement.name} – erfüllt`,
        detail: `Kandidat Level ${d.matchedSkill!.level} · Anforderung Level ${d.requirement.targetLevel} · Score-Beitrag: ${d.scoreContribution}/${d.requirement.weight}`,
        impact: "positive",
      });
    } else if (d.status === "partial") {
      scoreReasons.push({
        key: `detail-${d.requirement.id}`,
        title: `${d.requirement.name} – teilweise (Level ${d.matchedSkill?.level ?? 0} von ${d.requirement.targetLevel} gefordert)`,
        detail: `Abweichung ${d.levelDelta ?? 0} Level · Score-Beitrag: ${d.scoreContribution}/${d.requirement.weight} · Kategorie: ${d.requirement.category}`,
        impact: "neutral",
      });
    } else {
      scoreReasons.push({
        key: `detail-${d.requirement.id}`,
        title: `${d.requirement.name} – ${d.requirement.mustHave ? "Pflicht fehlt" : "Optional fehlt"}`,
        detail: `Kein passender Skill gefunden · Score-Beitrag: 0/${d.requirement.weight} · Kategorie: ${d.requirement.category}`,
        impact: "negative",
      });
    }
  }

  return {
    mocked: true,
    totalScore,
    recommendation,
    overlaps,
    gaps,
    details,
    scoreReasons,
  };
}

export function generateInterviewQuestions(match: MatchResult): InterviewQuestion[] {
  const gapQuestions = match.gaps.slice(0, 4).map((gap, idx) => ({
    id: `q-gap-${idx + 1}`,
    question: `Beschreiben Sie ein konkretes Projektbeispiel zu ${gap} und Ihre eigene Rolle darin.`,
    goal: "Validierung einer identifizierten Lücke",
    expectedEvidence: "Projektkontext, konkrete Entscheidungen, messbares Ergebnis",
    basedOn: `Gap: ${gap}`,
  }));

  const validationQuestions = match.details
    .filter((detail) => detail.status !== "gap")
    .slice(0, 3)
    .map((detail, idx) => ({
      id: `q-val-${idx + 1}`,
      question: `Wie tief war Ihr Beitrag bei ${detail.requirement.name} und welche Verantwortung hatten Sie?`,
      goal: "Vertiefung einer vorhandenen Überschneidung",
      expectedEvidence: "Tiefe, Umfang, Eigenleistung, Team-/Architekturentscheidungen",
      basedOn: `Overlap: ${detail.requirement.name}`,
    }));

  return [...gapQuestions, ...validationQuestions];
}

export function analyzeInterviewAnswers(interviewNotes: string, questions: InterviewQuestion[]): InterviewFinding[] {
  const text = normalized(interviewNotes);

  return questions.slice(0, 6).map((question, idx) => {
    const hasDepthSignal = ["ich habe", "verantwortet", "entscheidung", "produktion", "deploy"].some((key) => text.includes(key));
    const hasWeakSignal = ["ungefaehr", "glaube", "vielleicht", "nicht sicher"].some((key) => text.includes(key));

    let status: InterviewFinding["status"] = "teilweise";
    let note = "MOCK: Antwort enthält sowohl allgemeine als auch konkrete Elemente.";

    if (hasDepthSignal && !hasWeakSignal) {
      status = "bestatigt";
      note = "MOCK: Hinweise auf konkrete Eigenleistung und nachvollziehbare Projekterfahrung erkannt.";
    } else if (!hasDepthSignal && hasWeakSignal) {
      status = "nicht belegt";
      note = "MOCK: Aussagen bleiben vage, ohne belastbare Evidenz für die gefragte Erfahrung.";
    }

    return {
      id: `finding-${idx + 1}`,
      claim: question.basedOn,
      status,
      note,
    };
  });
}

export function parseUpload(fileName: string, raw: string): string {
  const lower = fileName.toLowerCase();
  const supportedText = lower.endsWith(".txt") || lower.endsWith(".md") || lower.endsWith(".csv");

  if (supportedText) {
    return raw;
  }

  return [
    `MOCK-EXTRAKTION für ${fileName}:`,
    "- Dokumenttyp wird lokal simuliert verarbeitet.",
    "- Strukturdaten (z.B. Tabellen, Abschnitte) sind beispielhaft extrahiert.",
    "- Bitte später echte Parser für PDF/DOCX/XLSX anbinden.",
    "",
    "Erkannte Keywords (MOCK): Next.js, TypeScript, Supabase, Datenschutz, Interview.",
  ].join("\n");

}

// ─── Batch Matching ──────────────────────────────────────────────────────────

export type BatchMatchEntry = {
  candidateId: string;
  candidateName: string;
  location: string;
  availabilityWeeks: number;
  totalExperienceYears: number;
  totalProjectMonths: number;
  score: number;
  recommendation: MatchResult["recommendation"];
  mustCoverage: number;
  needsHumanReview: boolean;
  criticalGaps: number;
  totalGaps: number;
  totalOverlaps: number;
  matchResult: MatchResult;
  candidateProfile: CandidateProfile;
  questions: InterviewQuestion[];
};

function calculateMustCoverageFromMatch(result: MatchResult): number {
  const mustRequirements = result.details.filter((detail) => detail.requirement.mustHave);
  if (mustRequirements.length === 0) {
    return 100;
  }

  const coveredMustRequirements = mustRequirements.filter((detail) => detail.status === "matched" || detail.status === "partial").length;
  return Math.round((coveredMustRequirements / mustRequirements.length) * 100);
}

function requiresHumanReview(result: MatchResult): boolean {
  return result.details.some((detail) => detail.requirement.mustHave && detail.status === "partial");
}

type BatchCandidateInput = {
  id: string;
  name: string;
  location: string;
  availabilityWeeks: number;
  totalProjectMonths: number;
  cvText: string;
  extensionMode: ExtensionMode;
};

export function runBatchMatch(
  projectTitle: string,
  projectText: string,
  projectExtensionMode: ExtensionMode,
  candidates: BatchCandidateInput[],
): { projectAnalysis: ProjectAnalysis; entries: BatchMatchEntry[] } {
  const projectAnalysis = analyzeProject(projectTitle, projectText, projectExtensionMode);

  const entries: BatchMatchEntry[] = candidates.map((candidate) => {
    const profile = analyzeCandidate(candidate.name, candidate.cvText, candidate.extensionMode);
    const skills = [
      ...profile.hardSkills,
      ...profile.softSkills,
      ...profile.toolSkills,
      ...profile.certifications,
    ];
    const result = calculateMatch(projectAnalysis.requirements, skills);
    const questions = generateInterviewQuestions(result);

    return {
      candidateId: candidate.id,
      candidateName: candidate.name,
      location: candidate.location,
      availabilityWeeks: candidate.availabilityWeeks,
      totalExperienceYears: profile.header.totalExperienceYears,
      totalProjectMonths: candidate.totalProjectMonths,
      score: result.totalScore,
      recommendation: result.recommendation,
      mustCoverage: calculateMustCoverageFromMatch(result),
      needsHumanReview: requiresHumanReview(result),
      criticalGaps: result.details.filter((d) => d.requirement.mustHave && d.status === "gap").length,
      totalGaps: result.gaps.length,
      totalOverlaps: result.overlaps.length,
      matchResult: result,
      candidateProfile: profile,
      questions,
    };
  });

  return { projectAnalysis, entries };
}

export function runBatchMatchForPosting(
  postingTitle: string,
  postingText: string,
  roleTitle: string,
  extensionMode: ExtensionMode,
  candidates: BatchCandidateInput[],
): { postingAnalysis: PostingAnalysis; entries: BatchMatchEntry[] } {
  const postingAnalysis = analyzePosting(postingTitle, postingText, roleTitle, extensionMode);

  const entries: BatchMatchEntry[] = candidates.map((candidate) => {
    const profile = analyzeCandidate(candidate.name, candidate.cvText, candidate.extensionMode);
    const skills = [
      ...profile.hardSkills,
      ...profile.softSkills,
      ...profile.toolSkills,
      ...profile.certifications,
    ];
    const result = calculateMatch(postingAnalysis.requirements, skills);
    const questions = generateInterviewQuestions(result);

    return {
      candidateId: candidate.id,
      candidateName: candidate.name,
      location: candidate.location,
      availabilityWeeks: candidate.availabilityWeeks,
      totalExperienceYears: profile.header.totalExperienceYears,
      totalProjectMonths: candidate.totalProjectMonths,
      score: result.totalScore,
      recommendation: result.recommendation,
      mustCoverage: calculateMustCoverageFromMatch(result),
      needsHumanReview: requiresHumanReview(result),
      criticalGaps: result.details.filter((d) => d.requirement.mustHave && d.status === "gap").length,
      totalGaps: result.gaps.length,
      totalOverlaps: result.overlaps.length,
      matchResult: result,
      candidateProfile: profile,
      questions,
    };
  });

  return { postingAnalysis, entries };
}
