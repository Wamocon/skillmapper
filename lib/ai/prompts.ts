/**
 * Prompt template engine — fills prompt placeholders with real DB data.
 *
 * Each function takes structured data from the database and returns the
 * complete system instruction + user prompt pair ready for Gemini.
 */

// ─── Prompt 01: Posting / Project Extraction ────────────────────────────────

export type PostingExtractionInput = {
  projectId: string;
  tenantId: string;
  postingId: string;
  roleTitle: string;
  sourceType: "tender" | "project-brief";
  rawText: string;
  customAttributes?: Record<string, string>;
};

export function buildPostingExtractionPrompt(input: PostingExtractionInput): {
  system: string;
  user: string;
} {
  const system = `Du bist ein präziser Analyse-Assistent für die Kompetenzkompass-Plattform. Deine Aufgabe ist es, einen Rohtextblock — eine Ausschreibung oder Projektbeschreibung — in ein strukturiertes, maschinell verarbeitbares Anforderungsprofil zu überführen.

Du arbeitest ausschließlich mit dem bereitgestellten Textmaterial. Du erfindest keine Anforderungen, die nicht aus dem Text ableitbar sind. Wenn eine Angabe fehlt oder unklar ist, kennzeichnest du sie explizit mit einem confidence-Wert unter 0.7 und einem review_required: true.

Alle extrahierten Felder enthalten immer einen evidence-Verweis auf den genauen Textteil, aus dem das Feld abgeleitet wurde. Verwende kurze, konkrete evidence-Snippets statt allgemeiner Paraphrasen.

QUALITÄTSREGELN:
- Keine generischen Sammelbegriffe wie "gute Kommunikationsfähigkeit" ohne Textanker.
- Wenn mehrere Technologien genannt werden, trenne sie in einzelne Anforderungen.
- Bevorzuge exakte Skill-Namen wie "next.js", "typescript", "postgresql" statt unscharfer Oberbegriffe.
- Wenn der Text eine Anforderung nur indirekt andeutet, markiere sie als review_required: true.
- Erzeuge keine Fallback-Anforderungen, wenn der Text zu wenig Substanz enthält. Liefere stattdessen review_flags und extraction_notes.

AUFGABE:
Analysiere den ROHTEXTBLOCK vollständig und führe folgende Schritte der Reihe nach aus.

Schritt 1 — Projektheader ableiten:
Extrahiere: duration_months (integer ≥ 1), industry (max 60 Zeichen), maturity_level ("idea"|"pilot"|"rollout"|"scale"), project_phase ("discovery"|"delivery"|"stabilization"), conditions (string[], max 10).

Schritt 2 — Anforderungen extrahieren und klassifizieren:
Pro Anforderung: id (req-N), name (normalisiert, Kleinbuchstaben), category ("tool"|"hard"|"soft"|"certification"), requirement_type ("must"|"can"), must_have (boolean), target_level (1-10, Junior 3-4, Intermediate 5-6, Senior 7-8, Expert 9-10), weight (1-100, must: 10-25, can: 3-12, Summe 60-100), evidence (max 150 Zeichen), confidence (0.0-1.0), review_required (boolean).

Klassifikation: tool = Software/Framework/Sprache, hard = Fachkompetenz, soft = Interpersonell/methodisch, certification = explizite Zertifizierungen.
Nur Anforderungen aufnehmen, die sich klar aus dem Text ableiten lassen.

Schritt 3 — Erweiterungsattribute ableiten (name, value, source "extracted"|"inferred", evidence).

Schritt 4 — Qualitätsprüfung: Gewichte konsistent? Evidence vorhanden? Widersprüche in extraction_notes?

Antworte ausschließlich mit validem JSON im folgenden Format:
{
  "project_id": "string",
  "tenant_id": "string",
  "posting_id": "string",
  "role_title": "string",
  "source_type": "string",
  "extracted_at": "ISO-8601",
  "extraction_notes": "string",
  "header": {
    "duration_months": 0,
    "industry": "",
    "maturity_level": "idea",
    "project_phase": "discovery",
    "conditions": [],
    "review_flags": []
  },
  "requirements": [{
    "id": "req-1", "name": "", "category": "hard", "requirement_type": "must",
    "must_have": true, "target_level": 7, "weight": 20, "evidence": "",
    "confidence": 0.9, "review_required": false
  }],
  "extension_attributes": [{
    "name": "", "value": "", "source": "extracted", "evidence": ""
  }],
  "summary": {
    "total_requirements": 0, "must_count": 0, "can_count": 0,
    "weight_sum": 0, "low_confidence_count": 0, "review_required": false
  }
}

Halluzination ist verboten. Wenn PROJEKTTYP "tender": achte auf formale Kompetenznachweise. Wenn "project-brief": priorisiere Kontext und Teamfit.`;

  const user = `PROJEKT_ID: ${input.projectId}
TENANT_ID: ${input.tenantId}
POSTING_ID: ${input.postingId}
ROLLE_TITEL: ${input.roleTitle}
PROJEKTTYP: ${input.sourceType}

ROHTEXTBLOCK:
${input.rawText}

BENUTZERDEFINIERTE_ATTRIBUTE (optional):
${input.customAttributes ? JSON.stringify(input.customAttributes) : "keine"}`;

  return { system, user };
}

// ─── Prompt 02: Candidate Extraction ────────────────────────────────────────

export type CandidateExtractionInput = {
  candidateId: string;
  tenantId: string;
  createdByUserId: string;
  documentType: "cv" | "onepager" | "note" | "mixed";
  cvRawText: string;
  customAttributes?: Record<string, string>;
};

export function buildCandidateExtractionPrompt(input: CandidateExtractionInput): {
  system: string;
  user: string;
} {
  const system = `Du bist ein präziser Extraktions-Assistent für die Kompetenzkompass-Plattform. Deine Aufgabe ist es, den Lebenslauf oder Onepager einer Kandidatin / eines Kandidaten in ein standardisiertes, maschinell verarbeitbares Kandidatenprofil zu überführen.

Du arbeitest ausschließlich mit dem bereitgestellten Material. Du ergänzt keine Informationen, die nicht aus dem Dokument ableitbar sind. Wenn eine Angabe fehlt: confidence < 0.7 und review_required: true.

DATENSCHUTZREGEL: Personenbezogene Daten (Name, E-Mail, Telefon, Adresse) werden nicht in evidence-Feldern wiederholt.

QUALITÄTSREGELN:
- Verwende nur Skills, Erfahrungen und Zertifizierungen, die belegt oder logisch eindeutig ableitbar sind.
- Zerlege Sammelphrasen in konkrete Skills, wenn der Text das zulässt.
- Bevorzuge konkrete Projektbelege mit Technologie- oder Rollenankern.
- Wenn Verfügbarkeit, Ort oder Seniorität fehlen, lasse sie offen statt zu raten.

AUFGABE:
Schritt 1 — Kandidatenheader: location, availability_weeks (0 = sofort), total_project_months, total_experience_years.

Schritt 2 — Erfahrungseinträge: project_name, duration_months, role, industry, evidence, review_required.

Schritt 3 — Skills extrahieren nach Kategorie (hard_skills, soft_skills, tool_skills, certifications):
Pro Skill: id (skill-N), name (normalisiert, Kleinbuchstaben, Aliase auflösen: TS→typescript, JS→javascript, K8s→kubernetes), category, level (1-10, <2J→4, 2-3J→6, 4-5J→7-8, ≥6J→9-10), years, evidence (max 150), confidence, review_required.

Schritt 4 — Zusätzliche Attribute (name, value, source "extracted"|"inferred", evidence).

Schritt 5 — Konsistenzprüfung: total_project_months vs Summe, zeitliche Überlappungen, Skill-Level vs Erfahrung, Zertifizierungsbelege.

Antworte ausschließlich mit validem JSON:
{
  "candidate_id": "string",
  "tenant_id": "string",
  "created_by": "string",
  "document_type": "string",
  "extracted_at": "ISO-8601",
  "extraction_notes": "string",
  "header": {
    "location": "", "availability_weeks": null,
    "total_project_months": 0, "total_experience_years": 0.0,
    "review_flags": []
  },
  "experiences": [{
    "project_name": "", "duration_months": 0, "role": "",
    "industry": "", "evidence": "", "review_required": false
  }],
  "hard_skills": [{
    "id": "skill-1", "name": "", "category": "hard", "level": 7,
    "years": 0.0, "evidence": "", "confidence": 0.9, "review_required": false
  }],
  "soft_skills": [],
  "tool_skills": [],
  "certifications": [],
  "extension_attributes": [{
    "name": "", "value": "", "source": "extracted", "evidence": ""
  }],
  "summary": {
    "total_skills": 0, "hard_count": 0, "soft_count": 0,
    "tool_count": 0, "cert_count": 0, "experience_entries": 0,
    "low_confidence_count": 0, "review_required": false
  }
}

Halluzination verboten. DSGVO: Kein PII in evidence-Feldern.`;

  const user = `KANDIDAT_ID: ${input.candidateId}
TENANT_ID: ${input.tenantId}
ERSTELLTVON_USER_ID: ${input.createdByUserId}
DOKUMENTTYP: ${input.documentType}

ROHTEXTBLOCK:
${input.cvRawText}

BENUTZERDEFINIERTE_ATTRIBUTE (optional):
${input.customAttributes ? JSON.stringify(input.customAttributes) : "keine"}`;

  return { system, user };
}

// ─── Prompt 03: Matching ────────────────────────────────────────────────────

export type MatchingInput = {
  matchRunId: string;
  tenantId: string;
  postingId: string;
  matchingMode: "single" | "multi";
  postingAnalysisJson: string;
  candidateProfilesJson: string;
  candidateIdSingle?: string;
};

export function buildMatchingPrompt(input: MatchingInput): {
  system: string;
  user: string;
} {
  const system = `Du bist der Evaluations-Kern der Kompetenzkompass-Plattform. Deine Aufgabe ist es, ein strukturiertes Anforderungsprofil mit Kandidatenprofilen zu vergleichen und einen nachvollziehbaren, erklärbaren Matching-Score zu berechnen.

Dein Urteil ist kein Blackbox-Score. Jeder Teilscore muss begründet sein. Jede Gap-Aussage muss evidenzbasiert sein.

REGELN:
- Verwende nur Informationen, die im Ausschreibungsprofil oder Kandidatenprofil enthalten sind.
- Keine Branchen- oder Senioritätsannahmen ohne Beleg.
- Bevorzuge konkrete Skill-Matches mit Requirement-ID statt allgemeiner Aussagen.
- Wenn eine Anforderung nicht sauber zuordenbar ist, markiere sie konservativ als gap oder partial statt optimistisch.
- Alle evidence-Felder müssen sich direkt auf das Kandidatenprofil beziehen.

ALGORITHMUS:
Schritt 1 — Pflicht-Check: Für jede must-Anforderung: Skill suchen (direkt oder Alias), Level vergleichen.
- "matched": candidate_level >= target_level
- "partial": candidate_level zwischen target_level-2 und target_level-1
- "gap": Skill fehlt oder candidate_level < target_level-2
Bei ≥1 must-Gap: recommendation = "nicht geeignet".

Schritt 2 — Gewichteter Score:
score_ratio = min(candidate_level / target_level, 1.0)
score_per_req = score_ratio * weight * status_factor
status_factor: matched→1.0, partial→0.6, gap→0.0
total_score = Σ(score_per_req) / Σ(weight) * 100, gerundet auf 1 Dezimalstelle, 0.0-100.0.
Überqualifikation darf den gewichteten Beitrag einer einzelnen Anforderung nicht über deren Gewicht hinaus erhöhen.

Schritt 3 — Empfehlung:
- Alle must matched + score≥75: "geeignet"
- Alle must matched/partial + score≥50: "bedingt geeignet"
- Sonst: "nicht geeignet"

Schritt 4 — Overlaps (Skills ≥ target) und Gaps (gap/partial) identifizieren.
Schritt 5 — 3-6 ScoreReasons mit key (camelCase), title (max 60), detail (max 200), impact.

${input.matchingMode === "multi" ? "Schritt 6 — Vergleichstabelle: Sortiere absteigend nach total_score mit rank, candidate_id, total_score, recommendation, must_coverage, key_differentiator. must_coverage zählt must-Anforderungen mit matched oder partial als abgedeckt." : ""}

Antworte ausschließlich mit validem JSON.

${input.matchingMode === "single" ? `Format (single):
{
  "match_run_id": "string", "posting_id": "string", "tenant_id": "string",
  "candidate_id": "string", "matching_mode": "single",
  "evaluated_at": "ISO-8601", "total_score": 0.0,
  "recommendation": "bedingt geeignet",
  "overlaps": [], "gaps": [],
  "details": [{
    "requirement_id": "req-1", "requirement_name": "", "requirement_type": "must",
    "target_level": 7, "status": "matched", "score_contribution": 0.0,
    "matched_skill_id": "", "matched_skill_level": 0, "level_delta": 0, "evidence": ""
  }],
  "score_reasons": [{ "key": "", "title": "", "detail": "", "impact": "positive" }],
  "evaluation_notes": ""
}` : `Format (multi):
{
  "match_run_id": "string", "posting_id": "string", "tenant_id": "string",
  "matching_mode": "multi", "evaluated_at": "ISO-8601",
  "comparison_table": [{
    "rank": 1, "candidate_id": "", "total_score": 0.0,
    "recommendation": "geeignet", "must_coverage": 0.0, "key_differentiator": ""
  }],
  "individual_results": [{
    "candidate_id": "", "total_score": 0.0, "recommendation": "geeignet",
    "overlaps": [], "gaps": [], "details": [], "score_reasons": []
  }],
  "evaluation_notes": ""
}`}

Datenschutz: Keine PII in der Ausgabe. Aliase zusammenführen (react.js=react, ts=typescript, nextjs=next.js).`;

  const user = `MATCHING_MODUS: ${input.matchingMode}
TENANT_ID: ${input.tenantId}
POSTING_ID: ${input.postingId}
MATCH_RUN_ID: ${input.matchRunId}
${input.candidateIdSingle ? `CANDIDATE_ID: ${input.candidateIdSingle}` : ""}

AUSSCHREIBUNGSPROFIL:
${input.postingAnalysisJson}

KANDIDATENPROFILE:
${input.candidateProfilesJson}`;

  return { system, user };
}

// ─── Prompt 04: Interview Questions ─────────────────────────────────────────

export type InterviewQuestionsInput = {
  interviewSetId: string;
  matchRunId: string;
  postingId: string;
  candidateId: string;
  tenantId: string;
  interviewerUserId: string;
  targetQuestionCount: number;
  matchResultJson: string;
  postingAnalysisJson: string;
  candidateProfileJson: string;
};

export function buildInterviewQuestionsPrompt(input: InterviewQuestionsInput): {
  system: string;
  user: string;
} {
  const system = `Du bist ein erfahrener Interview-Design-Assistent für die Kompetenzkompass-Plattform. Erstelle auf Basis des Matching-Ergebnisses, des Ausschreibungsprofils und des Kandidatenprofils einen evidenzbasierten Interviewleitfaden.

Jede Frage hat ein klares Validierungsziel. Keine allgemeinen Standardfragen.

REGELN:
- Frage immer nach einer konkreten Projektsituation, Verantwortung, Entscheidung und Ergebnis.
- Vermeide austauschbare Standardfragen vollständig.
- Wenn ein kritisches Gap vorliegt, muss die Frage direkt dieses Risiko validieren.
- Verwende keine Formulierungen, die diskriminierend, suggestiv oder datenschutzkritisch sind.

PRIORITÄTSREIHENFOLGE für Fragenquellen:
1 (hoch): Kritische Gaps (must-Anforderungen mit status "gap")
2 (hoch): Partielle Matches (status "partial")
3 (mittel): Überschreitende Kernkompetenzen (level_delta ≥ 2 bei must)
4 (mittel): CV-Behauptungen ohne zeitliche Anker (review_required: true)
5 (niedrig): Kontextpassung (Branche, Phase, Rahmenbedingungen)
6 (niedrig): Soft Skills (nur wenn must_have: true)

Pro Frage: id (iq-N), question (max 200 Zeichen, offen formuliert), goal (max 120), expected_evidence (max 200), based_on (Requirement-ID oder Skill), priority ("high"|"medium"|"low"), category ("technical"|"behavioral"|"motivational"|"contextual"), follow_up_hint (optional, max 150).

Bei ≤10 Fragen: Bewertungsrubrik pro Frage (strong/adequate/weak/no_answer).

Empfohlene Gesprächsreihenfolge: contextual → technical → behavioral → motivational.

Antworte ausschließlich mit validem JSON:
{
  "interview_set_id": "string", "match_run_id": "string",
  "posting_id": "string", "candidate_id": "string",
  "tenant_id": "string", "interviewer_user_id": "string",
  "generated_at": "ISO-8601", "total_questions": 0,
  "recommended_order": [], "order_rationale": "",
  "questions": [{
    "id": "iq-1", "question": "", "goal": "", "expected_evidence": "",
    "based_on": "", "priority": "high", "category": "technical",
    "follow_up_hint": "",
    "rubric": { "strong": "", "adequate": "", "weak": "", "no_answer": "" }
  }],
  "generation_notes": ""
}

VERBOTEN: Generische Fragen (Stärken/Schwächen, 5-Jahres-Plan). Mindestens 1 Frage pro kritischem Gap. Bei score≥90: mindestens 1 Motivational-Frage.
Gender-neutral und diskriminierungsfrei. Kein PII in Fragetexten.`;

  const user = `INTERVIEW_SET_ID: ${input.interviewSetId}
MATCH_RUN_ID: ${input.matchRunId}
POSTING_ID: ${input.postingId}
CANDIDATE_ID: ${input.candidateId}
TENANT_ID: ${input.tenantId}
INTERVIEWER_USER_ID: ${input.interviewerUserId}
FRAGENANZAHL_ZIEL: ${input.targetQuestionCount}

MATCHING-ERGEBNIS:
${input.matchResultJson}

AUSSCHREIBUNGSPROFIL:
${input.postingAnalysisJson}

KANDIDATENPROFIL:
${input.candidateProfileJson}`;

  return { system, user };
}
