-- Migration: 007 — Interview Sets, Interview Questions, and AI Extraction Log
-- These tables support the AI-powered interview question generation (Prompt 04)
-- and provide audit trail for all AI extraction operations.

-- ─── Interview Sets ─────────────────────────────────────────────────────────
-- Stores generated interview question sets linked to match runs.

CREATE TABLE IF NOT EXISTS public.interview_sets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_run_id UUID NOT NULL REFERENCES public.match_runs(id) ON DELETE CASCADE,
  posting_id   UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  tenant_id    UUID NOT NULL REFERENCES public.tenants(id),
  interviewer_user_id UUID REFERENCES public.users(id),
  total_questions     INTEGER NOT NULL DEFAULT 0,
  recommended_order   JSONB NOT NULL DEFAULT '[]'::jsonb,
  order_rationale     TEXT,
  generation_notes    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Interview Questions ────────────────────────────────────────────────────
-- Individual questions within an interview set.

CREATE TABLE IF NOT EXISTS public.interview_questions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_set_id  UUID NOT NULL REFERENCES public.interview_sets(id) ON DELETE CASCADE,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  question          TEXT NOT NULL,
  goal              TEXT NOT NULL,
  expected_evidence TEXT NOT NULL,
  based_on          TEXT NOT NULL,
  priority          TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  category          TEXT NOT NULL DEFAULT 'technical' CHECK (category IN ('technical', 'behavioral', 'motivational', 'contextual')),
  follow_up_hint    TEXT,
  rubric            JSONB,
  -- Interview response fields (filled after conducting the interview)
  response_rating   INTEGER CHECK (response_rating BETWEEN 0 AND 3),
  response_notes    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── AI Extraction Log ──────────────────────────────────────────────────────
-- Audit trail for all AI operations (extraction, matching, interview generation).

CREATE TABLE IF NOT EXISTS public.ai_extraction_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES public.tenants(id),
  user_id        UUID REFERENCES public.users(id),
  operation_type TEXT NOT NULL CHECK (operation_type IN (
    'posting_extraction', 'candidate_extraction', 'single_match', 'multi_match', 'interview_generation'
  )),
  entity_type    TEXT NOT NULL CHECK (entity_type IN ('job_posting', 'candidate', 'match_run', 'interview_set')),
  entity_id      UUID NOT NULL,
  model_used     TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
  input_tokens   INTEGER,
  output_tokens  INTEGER,
  duration_ms    INTEGER,
  status         TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error', 'partial')),
  error_message  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_interview_sets_match_run ON public.interview_sets(match_run_id);
CREATE INDEX IF NOT EXISTS idx_interview_sets_posting ON public.interview_sets(posting_id);
CREATE INDEX IF NOT EXISTS idx_interview_sets_candidate ON public.interview_sets(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interview_sets_tenant ON public.interview_sets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_set ON public.interview_questions(interview_set_id);
CREATE INDEX IF NOT EXISTS idx_ai_log_tenant ON public.ai_extraction_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_log_entity ON public.ai_extraction_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_log_created ON public.ai_extraction_log(created_at DESC);

-- ─── RLS Policies ───────────────────────────────────────────────────────────

ALTER TABLE public.interview_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_extraction_log ENABLE ROW LEVEL SECURITY;

-- Interview sets: users can see sets within their tenant
CREATE POLICY interview_sets_tenant_read ON public.interview_sets
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE auth_uid = auth.uid()
    )
  );

CREATE POLICY interview_sets_tenant_insert ON public.interview_sets
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE auth_uid = auth.uid()
    )
  );

-- Interview questions: accessible via interview_set relationship
CREATE POLICY interview_questions_tenant_read ON public.interview_questions
  FOR SELECT USING (
    interview_set_id IN (
      SELECT id FROM public.interview_sets WHERE tenant_id IN (
        SELECT tenant_id FROM public.users WHERE auth_uid = auth.uid()
      )
    )
  );

CREATE POLICY interview_questions_tenant_insert ON public.interview_questions
  FOR INSERT WITH CHECK (
    interview_set_id IN (
      SELECT id FROM public.interview_sets WHERE tenant_id IN (
        SELECT tenant_id FROM public.users WHERE auth_uid = auth.uid()
      )
    )
  );

-- AI extraction log: users can see logs within their tenant
CREATE POLICY ai_log_tenant_read ON public.ai_extraction_log
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE auth_uid = auth.uid()
    )
  );

CREATE POLICY ai_log_tenant_insert ON public.ai_extraction_log
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE auth_uid = auth.uid()
    )
  );
