import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as loadDotenv } from "dotenv";
import { extractCandidateProfile, extractPostingAnalysis } from "../lib/ai/extraction";
import { generateAIInterviewQuestions } from "../lib/ai/interview";
import { runAISingleMatch } from "../lib/ai/matching";
import { sanitizeInterviewQuestionSet, sanitizePostingExtraction } from "../lib/ai/validation";

loadDotenv({ path: ".env.local", quiet: true });
loadDotenv({ quiet: true });

process.on("unhandledRejection", (error) => {
  console.error("Unhandled AI QA rejection", error);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Unhandled AI QA exception", error);
  process.exit(1);
});

const postingText = `
Senior Frontend Architect fuer ein B2B Matching-Produkt.
Pflicht sind Next.js, React, TypeScript, Architekturarbeit, Stakeholder-Kommunikation und Teststrategie.
Das Projekt laeuft 9 Monate in der Delivery-Phase fuer eine regulierte Plattform im HR-Umfeld.
Nice to have sind Supabase, Tailwind CSS und Professional Scrum Master.
Erwartet wird nachweisbare Erfahrung in skalierbaren Webanwendungen und enger Zusammenarbeit mit Produkt und Fachbereich.
`;

const strongCandidateText = `
Senior Frontend Engineer und Solution Architect mit 7 Jahren Erfahrung.
2022-2025: Lead fuer eine Next.js und React Plattform mit TypeScript, Tailwind CSS und Supabase.
Verantwortlich fuer Architektur, Teststrategie mit Playwright sowie Abstimmung mit Produktleitung und Stakeholdern.
2020-2022: Aufbau eines B2B Portals mit React, TypeScript und PostgreSQL.
Professional Scrum Master Zertifizierung vorhanden. Verfuegbar in 2 Wochen, Standort Berlin.
`;

const weakCandidateText = `
Generalist mit Schwerpunkt Content Management und Office-Administration.
Erfahrung mit Excel, PowerPoint und einfacher Webseitenpflege.
Keine belastbaren Projektbeispiele fuer React, Next.js, TypeScript oder Architektur.
Verfuegbar in 8 Wochen, Standort Hamburg.
`;

async function main() {
  console.log("AI QA starting");

  assert.throws(
    () => sanitizePostingExtraction({ requirements: [] }),
    /too few grounded requirements/i,
    "Posting sanitizer should reject empty requirement payloads.",
  );

  const posting = await extractPostingAnalysis({
    projectId: "qa-project",
    tenantId: "qa-tenant",
    postingId: "qa-posting",
    roleTitle: "Senior Frontend Architect",
    sourceType: "project-brief",
    rawText: postingText,
  });
  console.log("- Posting extraction passed");

  const postingRequirements = posting.data.requirements.map((item) => item.name);
  assert(postingRequirements.includes("next.js"), "Posting extraction should identify next.js.");
  assert(postingRequirements.includes("typescript"), "Posting extraction should identify typescript.");

  const strongCandidate = await extractCandidateProfile({
    candidateId: "candidate-strong",
    tenantId: "qa-tenant",
    createdByUserId: "qa-user",
    documentType: "cv",
    cvRawText: strongCandidateText,
  });
  console.log("- Strong candidate extraction passed");

  const weakCandidate = await extractCandidateProfile({
    candidateId: "candidate-weak",
    tenantId: "qa-tenant",
    createdByUserId: "qa-user",
    documentType: "cv",
    cvRawText: weakCandidateText,
  });
  console.log("- Weak candidate extraction passed");

  const strongSkills = [
    ...strongCandidate.data.hard_skills,
    ...strongCandidate.data.tool_skills,
    ...strongCandidate.data.certifications,
  ].map((item) => item.name);
  assert(strongSkills.includes("next.js"), "Strong candidate extraction should identify next.js.");
  assert(strongSkills.includes("react"), "Strong candidate extraction should identify react.");

  const strongMatch = await runAISingleMatch({
    matchRunId: randomUUID(),
    tenantId: "qa-tenant",
    postingId: "qa-posting",
    candidateIdSingle: "candidate-strong",
    postingAnalysisJson: JSON.stringify(posting.data),
    candidateProfilesJson: JSON.stringify([strongCandidate.data]),
  });
  console.log("- Strong candidate matching passed");

  const weakMatch = await runAISingleMatch({
    matchRunId: randomUUID(),
    tenantId: "qa-tenant",
    postingId: "qa-posting",
    candidateIdSingle: "candidate-weak",
    postingAnalysisJson: JSON.stringify(posting.data),
    candidateProfilesJson: JSON.stringify([weakCandidate.data]),
  });
  console.log("- Weak candidate matching passed");

  const strongMatchedMust = strongMatch.data.details.filter((item) => item.requirement_type === "must" && item.status === "matched").length;
  const weakMatchedMust = weakMatch.data.details.filter((item) => item.requirement_type === "must" && item.status === "matched").length;
  const strongMatchedTotal = strongMatch.data.details.filter((item) => item.status === "matched").length;
  const weakMatchedTotal = weakMatch.data.details.filter((item) => item.status === "matched").length;

  assert(strongMatch.data.total_score >= 0 && strongMatch.data.total_score <= 100, "Strong candidate score should stay within 0-100.");
  assert(weakMatch.data.total_score >= 0 && weakMatch.data.total_score <= 100, "Weak candidate score should stay within 0-100.");
  assert(strongMatch.data.total_score > weakMatch.data.total_score, "Strong candidate should score higher than weak candidate.");
  assert(strongMatchedTotal >= weakMatchedTotal, "Strong candidate should not match fewer grounded criteria than the weak candidate.");
  assert.equal(weakMatch.data.recommendation, "nicht geeignet", "Weak candidate should be rejected.");

  const interview = await generateAIInterviewQuestions({
    interviewSetId: randomUUID(),
    matchRunId: strongMatch.data.match_run_id,
    postingId: "qa-posting",
    candidateId: "candidate-strong",
    tenantId: "qa-tenant",
    interviewerUserId: "qa-user",
    targetQuestionCount: 6,
    matchResultJson: JSON.stringify(strongMatch.data),
    postingAnalysisJson: JSON.stringify(posting.data),
    candidateProfileJson: JSON.stringify(strongCandidate.data),
  });
  console.log("- Interview generation passed");

  assert(interview.data.questions.length >= 3, "Interview generation should produce multiple grounded questions.");

  const sanitizedQuestions = sanitizeInterviewQuestionSet(
    {
      interview_set_id: "demo",
      match_run_id: "demo",
      posting_id: "demo",
      candidate_id: "demo",
      tenant_id: "demo",
      interviewer_user_id: "demo",
      generated_at: new Date().toISOString(),
      total_questions: 1,
      recommended_order: ["iq-1"],
      order_rationale: "demo",
      questions: [
        {
          id: "iq-1",
          question: "Where do you see yourself in five years?",
          goal: "generic",
          expected_evidence: "generic",
          based_on: "req-1",
          priority: "low",
          category: "motivational",
          follow_up_hint: "generic",
        },
      ],
      generation_notes: "demo",
    },
    weakMatch.data,
    4,
  );

  assert(
    sanitizedQuestions.questions.every((question) => !/five years?/i.test(question.question)),
    "Interview sanitizer should remove banned generic questions.",
  );

  console.log("AI QA summary");
  console.log(`- Posting requirements extracted: ${posting.data.requirements.length}`);
  console.log(`- Strong candidate score: ${strongMatch.data.total_score}`);
  console.log(`- Strong candidate matched must-haves: ${strongMatchedMust}`);
  console.log(`- Weak candidate score: ${weakMatch.data.total_score}`);
  console.log(`- Weak candidate matched must-haves: ${weakMatchedMust}`);
  console.log(`- Interview questions generated: ${interview.data.questions.length}`);
  console.log("- Negative-path sanitizers: passed");
}

main().catch((error) => {
  console.error("AI QA failed");
  console.error(error);
  process.exit(1);
});