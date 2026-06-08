-- Track chat sessions linked to applications
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT REFERENCES public.applications(id) ON DELETE CASCADE,
    jobseeker_id bigint NOT NULL, 
    employee_id bigint NOT NULL, 
    is_unlocked BOOLEAN DEFAULT FALSE,
    msg_count_jobseeker INTEGER DEFAULT 0,
    msg_count_employee INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(application_id),
    CONSTRAINT chat_sessions_jobseeker_id_fkey FOREIGN KEY (jobseeker_id) REFERENCES public.jobseekers (id) ON DELETE CASCADE
);

-- Store actual messages
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger to sync is_unlocked from applications table
CREATE OR REPLACE FUNCTION sync_chat_unlock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chat_sessions 
    SET is_unlocked = NEW.is_unlocked 
    WHERE application_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_application_unlock ON public.applications;
CREATE TRIGGER on_application_unlock
AFTER UPDATE OF is_unlocked ON public.applications
FOR EACH ROW EXECUTE FUNCTION sync_chat_unlock();

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
