/**
 * AI module barrel export.
 * Import all AI functions from this single entry point.
 */

// Gemini client
export { generateJSON, generateText } from "./gemini-client";

// Extraction (Prompts 01 + 02)
export {
  extractPostingAnalysis,
  extractCandidateProfile,
  type PostingExtractionResult,
  type CandidateExtractionResult,
  type ExtractedRequirement,
  type ExtractedSkill,
  type ExtractedExperience,
} from "./extraction";

// Matching (Prompt 03)
export {
  runAISingleMatch,
  runAIMultiMatch,
  type SingleMatchResult,
  type MultiMatchResult,
  type MatchDetail,
  type ScoreReason,
} from "./matching";

// Interview Questions (Prompt 04)
export {
  generateAIInterviewQuestions,
  type InterviewQuestionSet,
  type AIInterviewQuestion,
} from "./interview";

// Prompt builders (for advanced use / testing)
export {
  buildPostingExtractionPrompt,
  buildCandidateExtractionPrompt,
  buildMatchingPrompt,
  buildInterviewQuestionsPrompt,
} from "./prompts";
