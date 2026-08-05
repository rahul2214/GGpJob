-- migration to create saved_jobs table
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_pk BIGINT NOT NULL REFERENCES public.jobseekers(id) ON DELETE CASCADE,
    job_pk BIGINT NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_pk, job_pk)
);

-- Enable RLS
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Users can insert their own saved jobs" 
ON public.saved_jobs FOR INSERT 
WITH CHECK (
  user_pk IN (
    SELECT id FROM public.jobseekers WHERE uuid = auth.uid()
  )
);

CREATE POLICY "Users can view their own saved jobs" 
ON public.saved_jobs FOR SELECT 
USING (
  user_pk IN (
    SELECT id FROM public.jobseekers WHERE uuid = auth.uid()
  )
);

CREATE POLICY "Users can delete their own saved jobs" 
ON public.saved_jobs FOR DELETE 
USING (
  user_pk IN (
    SELECT id FROM public.jobseekers WHERE uuid = auth.uid()
  )
);

-- Add index on user_pk for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_pk ON public.saved_jobs(user_pk);
