-- SQL Migration: Recreate ats_analyses table to store only the latest analysis per user
DROP TABLE IF EXISTS public.ats_analyses CASCADE;

CREATE TABLE public.ats_analyses (
    user_id bigint PRIMARY KEY,
    score INTEGER NOT NULL,
    result_json JSONB NOT NULL,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT ats_analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.jobseekers(id) ON DELETE CASCADE
);

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
