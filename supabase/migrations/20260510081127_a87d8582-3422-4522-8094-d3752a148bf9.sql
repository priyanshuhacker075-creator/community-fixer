
ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS reporter_email TEXT,
  ADD COLUMN IF NOT EXISTS points_awarded INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reward_status TEXT NOT NULL DEFAULT 'unclaimed',
  ADD COLUMN IF NOT EXISTS reward_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reward_note TEXT;

CREATE INDEX IF NOT EXISTS idx_issues_reporter_email ON public.issues(reporter_email);
CREATE INDEX IF NOT EXISTS idx_issues_voter_id ON public.issues(voter_id);
