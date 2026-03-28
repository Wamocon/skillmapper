-- Migration 008: Add candidate_comments table and posting priority
-- Adds comments system for candidates and priority field for job postings.

-- ─── Add priority column to job_postings ──────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_postings' AND column_name = 'priority'
  ) THEN
    ALTER TABLE public.job_postings
      ADD COLUMN priority text NOT NULL DEFAULT 'medium'
      CHECK (priority IN ('high', 'medium', 'low'));
  END IF;
END $$;

-- ─── Create candidate_comments table ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.candidate_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  section text NOT NULL DEFAULT 'general',
  text text NOT NULL,
  author_name text NOT NULL,
  author_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_candidate_comments_candidate_id ON public.candidate_comments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_comments_status ON public.candidate_comments(status);

-- RLS
ALTER TABLE public.candidate_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for candidate_comments" ON public.candidate_comments
  USING (tenant_id = (SELECT tenant_id FROM public.users WHERE auth_uid = auth.uid()));

CREATE POLICY "Insert own comments" ON public.candidate_comments
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM public.users WHERE auth_uid = auth.uid())
  );

CREATE POLICY "Update own comments" ON public.candidate_comments
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE auth_uid = auth.uid())
  );

-- ─── Mirror in test schema ───────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'test' AND table_name = 'job_postings' AND column_name = 'priority'
  ) THEN
    ALTER TABLE test.job_postings
      ADD COLUMN priority text NOT NULL DEFAULT 'medium';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS test.candidate_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  section text NOT NULL DEFAULT 'general',
  text text NOT NULL,
  author_name text NOT NULL,
  author_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz
);
