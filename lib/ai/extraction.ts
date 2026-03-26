/**
 * AI Extraction — Posting analysis and Candidate profile extraction.
 * Replaces mock functions with real Gemini AI calls.
 * Results are persisted to mapped_profile JSONB columns in Supabase.
 */

import { generateStructuredData, type StructuredGenerationResult } from "./gemini-client";
import {
  buildPostingExtractionPrompt,
  buildCandidateExtractionPrompt,
  type PostingExtractionInput,
  type CandidateExtractionInput,
} from "./prompts";
import { postingExtractionJsonSchema, candidateExtractionJsonSchema } from "./schemas";
import { sanitizePostingExtraction, sanitizeCandidateExtraction } from "./validation";

// ─── Types matching the prompt output schemas ───────────────────────────────

export interface ExtractedRequirement {
  id: string;
  name: string;
  category: "tool" | "hard" | "soft" | "certification";
  requirement_type: "must" | "can";
  must_have: boolean;
  target_level: number;
  weight: number;
  evidence: string;
  confidence: number;
  review_required: boolean;
}

export interface ExtractedHeader {
  duration_months: number;
  industry: string;
  maturity_level: "idea" | "pilot" | "rollout" | "scale";
  project_phase: "discovery" | "delivery" | "stabilization";
  conditions: string[];
  review_flags: string[];
}

export interface ExtractedExtensionAttribute {
  name: string;
  value: string;
  source: "extracted" | "inferred";
  evidence: string;
}

export interface PostingExtractionResult {
  project_id: string;
  tenant_id: string;
  posting_id: string;
  role_title: string;
  source_type: string;
  extracted_at: string;
  extraction_notes: string;
  header: ExtractedHeader;
  requirements: ExtractedRequirement[];
  extension_attributes: ExtractedExtensionAttribute[];
  summary: {
    total_requirements: number;
    must_count: number;
    can_count: number;
    weight_sum: number;
    low_confidence_count: number;
    review_required: boolean;
  };
}

export interface ExtractedSkill {
  id: string;
  name: string;
  category: "tool" | "hard" | "soft" | "certification";
  level: number;
  years: number;
  evidence: string;
  confidence: number;
  review_required: boolean;
}

export interface ExtractedExperience {
  project_name: string;
  duration_months: number;
  role: string;
  industry: string;
  evidence: string;
  review_required: boolean;
}

export interface CandidateExtractionResult {
  candidate_id: string;
  tenant_id: string;
  created_by: string;
  document_type: string;
  extracted_at: string;
  extraction_notes: string;
  header: {
    location: string;
    availability_weeks: number | null;
    total_project_months: number;
    total_experience_years: number;
    review_flags: string[];
  };
  experiences: ExtractedExperience[];
  hard_skills: ExtractedSkill[];
  soft_skills: ExtractedSkill[];
  tool_skills: ExtractedSkill[];
  certifications: ExtractedSkill[];
  extension_attributes: ExtractedExtensionAttribute[];
  summary: {
    total_skills: number;
    hard_count: number;
    soft_count: number;
    tool_count: number;
    cert_count: number;
    experience_entries: number;
    low_confidence_count: number;
    review_required: boolean;
  };
}

export interface ExtractionGenerationResult<T> extends StructuredGenerationResult<T> {}

// ─── Main extraction functions ──────────────────────────────────────────────

/**
 * Extract structured posting/project analysis from raw text using Gemini AI.
 * This replaces the mock `analyzeProject` / `analyzePosting` functions.
 */
export async function extractPostingAnalysis(
  input: PostingExtractionInput,
): Promise<ExtractionGenerationResult<PostingExtractionResult>> {
  const { system, user } = buildPostingExtractionPrompt(input);
  const result = await generateStructuredData<PostingExtractionResult>(system, user, {
    responseJsonSchema: postingExtractionJsonSchema,
    validate: sanitizePostingExtraction,
  });

  // Ensure IDs are properly set from input (don't trust AI to echo them correctly)
  result.data.project_id = input.projectId;
  result.data.tenant_id = input.tenantId;
  result.data.posting_id = input.postingId;
  result.data.role_title = input.roleTitle;
  result.data.source_type = input.sourceType;

  return result;
}

/**
 * Extract structured candidate profile from CV/onepager using Gemini AI.
 * This replaces the mock `analyzeCandidate` function.
 */
export async function extractCandidateProfile(
  input: CandidateExtractionInput,
): Promise<ExtractionGenerationResult<CandidateExtractionResult>> {
  const { system, user } = buildCandidateExtractionPrompt(input);
  const result = await generateStructuredData<CandidateExtractionResult>(system, user, {
    responseJsonSchema: candidateExtractionJsonSchema,
    validate: sanitizeCandidateExtraction,
  });

  // Ensure IDs are properly set from input
  result.data.candidate_id = input.candidateId;
  result.data.tenant_id = input.tenantId;
  result.data.created_by = input.createdByUserId;
  result.data.document_type = input.documentType;

  return result;
}
