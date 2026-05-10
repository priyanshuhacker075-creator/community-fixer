
-- Issues table
CREATE TABLE public.issues (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  reporter TEXT NOT NULL DEFAULT 'Anonymous',
  voter_id TEXT,
  image TEXT,
  severity TEXT,
  ai_reasoning TEXT,
  ai_verification JSONB,
  upvote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id TEXT NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (issue_id, voter_id)
);

CREATE TABLE public.issue_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id TEXT NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "issues read all" ON public.issues FOR SELECT USING (true);
CREATE POLICY "issues insert all" ON public.issues FOR INSERT WITH CHECK (true);
CREATE POLICY "issues update all" ON public.issues FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "upvotes read all" ON public.upvotes FOR SELECT USING (true);
CREATE POLICY "upvotes insert all" ON public.upvotes FOR INSERT WITH CHECK (true);
CREATE POLICY "upvotes delete all" ON public.upvotes FOR DELETE USING (true);

CREATE POLICY "issue_updates read all" ON public.issue_updates FOR SELECT USING (true);
CREATE POLICY "issue_updates insert all" ON public.issue_updates FOR INSERT WITH CHECK (true);

-- Upvote count trigger
CREATE OR REPLACE FUNCTION public.sync_upvote_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.issues SET upvote_count = upvote_count + 1 WHERE id = NEW.issue_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.issues SET upvote_count = GREATEST(upvote_count - 1, 0) WHERE id = OLD.issue_id;
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER upvote_count_ins AFTER INSERT ON public.upvotes FOR EACH ROW EXECUTE FUNCTION public.sync_upvote_count();
CREATE TRIGGER upvote_count_del AFTER DELETE ON public.upvotes FOR EACH ROW EXECUTE FUNCTION public.sync_upvote_count();

-- Realtime
ALTER TABLE public.issues REPLICA IDENTITY FULL;
ALTER TABLE public.upvotes REPLICA IDENTITY FULL;
ALTER TABLE public.issue_updates REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.issues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.upvotes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.issue_updates;

CREATE INDEX idx_issues_created_at ON public.issues (created_at DESC);
CREATE INDEX idx_upvotes_issue ON public.upvotes (issue_id);
CREATE INDEX idx_issue_updates_issue ON public.issue_updates (issue_id, created_at);
