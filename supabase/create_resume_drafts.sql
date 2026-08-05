-- SQL Migration: Create resume_drafts table for version history
DROP TABLE IF EXISTS public.resume_drafts CASCADE;

CREATE TABLE public.resume_drafts (
    user_id bigint PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Untitled Resume',
    template_type TEXT NOT NULL DEFAULT 'Software Engineer',
    resume_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT resume_drafts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.jobseekers(id) ON DELETE CASCADE
);

-- Index on user_id for fast lookup
CREATE INDEX idx_resume_drafts_user_id ON public.resume_drafts(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.resume_drafts ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can manage their own resume drafts" ON public.resume_drafts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.jobseekers 
            WHERE jobseekers.id = resume_drafts.user_id 
            AND jobseekers.uuid = auth.uid()
        )
    );

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
