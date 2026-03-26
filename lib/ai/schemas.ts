const requiredString = { type: "string", minLength: 1 } as const;

const requirementSchema = {
  type: "object",
  additionalProperties: true,
  required: ["id", "name", "category", "requirement_type", "must_have", "target_level", "weight", "evidence", "confidence", "review_required"],
  properties: {
    id: requiredString,
    name: requiredString,
    category: { type: "string", enum: ["tool", "hard", "soft", "certification"] },
    requirement_type: { type: "string", enum: ["must", "can"] },
    must_have: { type: "boolean" },
    target_level: { type: "number" },
    weight: { type: "number" },
    evidence: requiredString,
    confidence: { type: "number" },
    review_required: { type: "boolean" },
  },
} as const;

const skillSchema = {
  type: "object",
  additionalProperties: true,
  required: ["id", "name", "category", "level", "years", "evidence", "confidence", "review_required"],
  properties: {
    id: requiredString,
    name: requiredString,
    category: { type: "string", enum: ["tool", "hard", "soft", "certification"] },
    level: { type: "number" },
    years: { type: "number" },
    evidence: requiredString,
    confidence: { type: "number" },
    review_required: { type: "boolean" },
  },
} as const;

const extensionAttributeSchema = {
  type: "object",
  additionalProperties: true,
  required: ["name", "value", "source", "evidence"],
  properties: {
    name: requiredString,
    value: requiredString,
    source: { type: "string", enum: ["extracted", "inferred"] },
    evidence: requiredString,
  },
} as const;

export const postingExtractionJsonSchema = {
  type: "object",
  additionalProperties: true,
  required: ["project_id", "tenant_id", "posting_id", "role_title", "source_type", "extracted_at", "extraction_notes", "header", "requirements", "extension_attributes", "summary"],
  properties: {
    project_id: requiredString,
    tenant_id: requiredString,
    posting_id: requiredString,
    role_title: requiredString,
    source_type: { type: "string", enum: ["tender", "project-brief"] },
    extracted_at: requiredString,
    extraction_notes: { type: "string" },
    header: {
      type: "object",
      additionalProperties: true,
      required: ["duration_months", "industry", "maturity_level", "project_phase", "conditions", "review_flags"],
      properties: {
        duration_months: { type: "number" },
        industry: requiredString,
        maturity_level: { type: "string", enum: ["idea", "pilot", "rollout", "scale"] },
        project_phase: { type: "string", enum: ["discovery", "delivery", "stabilization"] },
        conditions: { type: "array", items: { type: "string" } },
        review_flags: { type: "array", items: { type: "string" } },
      },
    },
    requirements: { type: "array", items: requirementSchema },
    extension_attributes: { type: "array", items: extensionAttributeSchema },
    summary: {
      type: "object",
      additionalProperties: true,
      required: ["total_requirements", "must_count", "can_count", "weight_sum", "low_confidence_count", "review_required"],
      properties: {
        total_requirements: { type: "number" },
        must_count: { type: "number" },
        can_count: { type: "number" },
        weight_sum: { type: "number" },
        low_confidence_count: { type: "number" },
        review_required: { type: "boolean" },
      },
    },
  },
} as const;

export const candidateExtractionJsonSchema = {
  type: "object",
  additionalProperties: true,
  required: ["candidate_id", "tenant_id", "created_by", "document_type", "extracted_at", "extraction_notes", "header", "experiences", "hard_skills", "soft_skills", "tool_skills", "certifications", "extension_attributes", "summary"],
  properties: {
    candidate_id: requiredString,
    tenant_id: requiredString,
    created_by: requiredString,
    document_type: requiredString,
    extracted_at: requiredString,
    extraction_notes: { type: "string" },
    header: {
      type: "object",
      additionalProperties: true,
      required: ["location", "availability_weeks", "total_project_months", "total_experience_years", "review_flags"],
      properties: {
        location: { type: "string" },
        availability_weeks: { type: ["number", "null"] },
        total_project_months: { type: "number" },
        total_experience_years: { type: "number" },
        review_flags: { type: "array", items: { type: "string" } },
      },
    },
    experiences: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: true,
        required: ["project_name", "duration_months", "role", "industry", "evidence", "review_required"],
        properties: {
          project_name: requiredString,
          duration_months: { type: "number" },
          role: requiredString,
          industry: { type: "string" },
          evidence: requiredString,
          review_required: { type: "boolean" },
        },
      },
    },
    hard_skills: { type: "array", items: skillSchema },
    soft_skills: { type: "array", items: skillSchema },
    tool_skills: { type: "array", items: skillSchema },
    certifications: { type: "array", items: skillSchema },
    extension_attributes: { type: "array", items: extensionAttributeSchema },
    summary: {
      type: "object",
      additionalProperties: true,
      required: ["total_skills", "hard_count", "soft_count", "tool_count", "cert_count", "experience_entries", "low_confidence_count", "review_required"],
      properties: {
        total_skills: { type: "number" },
        hard_count: { type: "number" },
        soft_count: { type: "number" },
        tool_count: { type: "number" },
        cert_count: { type: "number" },
        experience_entries: { type: "number" },
        low_confidence_count: { type: "number" },
        review_required: { type: "boolean" },
      },
    },
  },
} as const;

export const singleMatchJsonSchema = {
  type: "object",
  additionalProperties: true,
  required: ["match_run_id", "posting_id", "tenant_id", "candidate_id", "matching_mode", "evaluated_at", "total_score", "recommendation", "overlaps", "gaps", "details", "score_reasons", "evaluation_notes"],
  properties: {
    match_run_id: requiredString,
    posting_id: requiredString,
    tenant_id: requiredString,
    candidate_id: requiredString,
    matching_mode: { type: "string", enum: ["single"] },
    evaluated_at: requiredString,
    total_score: { type: "number" },
    recommendation: { type: "string", enum: ["geeignet", "bedingt geeignet", "nicht geeignet"] },
    overlaps: { type: "array", items: { type: "string" } },
    gaps: { type: "array", items: { type: "string" } },
    details: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: true,
        required: ["requirement_id", "requirement_name", "requirement_type", "target_level", "status", "score_contribution", "matched_skill_id", "matched_skill_level", "level_delta", "evidence"],
        properties: {
          requirement_id: requiredString,
          requirement_name: requiredString,
          requirement_type: { type: "string", enum: ["must", "can"] },
          target_level: { type: "number" },
          status: { type: "string", enum: ["matched", "partial", "gap"] },
          score_contribution: { type: "number" },
          matched_skill_id: { type: ["string", "null"] },
          matched_skill_level: { type: "number" },
          level_delta: { type: "number" },
          evidence: requiredString,
        },
      },
    },
    score_reasons: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: true,
        required: ["key", "title", "detail", "impact"],
        properties: {
          key: requiredString,
          title: requiredString,
          detail: requiredString,
          impact: { type: "string", enum: ["positive", "neutral", "negative"] },
        },
      },
    },
    evaluation_notes: { type: "string" },
  },
} as const;

export const interviewQuestionSetJsonSchema = {
  type: "object",
  additionalProperties: true,
  required: ["interview_set_id", "match_run_id", "posting_id", "candidate_id", "tenant_id", "interviewer_user_id", "generated_at", "total_questions", "recommended_order", "order_rationale", "questions", "generation_notes"],
  properties: {
    interview_set_id: requiredString,
    match_run_id: requiredString,
    posting_id: requiredString,
    candidate_id: requiredString,
    tenant_id: requiredString,
    interviewer_user_id: requiredString,
    generated_at: requiredString,
    total_questions: { type: "number" },
    recommended_order: { type: "array", items: { type: "string" } },
    order_rationale: { type: "string" },
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: true,
        required: ["id", "question", "goal", "expected_evidence", "based_on", "priority", "category", "follow_up_hint"],
        properties: {
          id: requiredString,
          question: requiredString,
          goal: requiredString,
          expected_evidence: requiredString,
          based_on: requiredString,
          priority: { type: "string", enum: ["high", "medium", "low"] },
          category: { type: "string", enum: ["technical", "behavioral", "motivational", "contextual"] },
          follow_up_hint: { type: "string" },
          rubric: {
            type: "object",
            additionalProperties: true,
            properties: {
              strong: { type: "string" },
              adequate: { type: "string" },
              weak: { type: "string" },
              no_answer: { type: "string" },
            },
          },
        },
      },
    },
    generation_notes: { type: "string" },
  },
} as const;
