-- 1. Add count columns to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS applicant_count INTEGER DEFAULT 0;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS selected_count INTEGER DEFAULT 0;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS referred_count INTEGER DEFAULT 0;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS hired_count INTEGER DEFAULT 0;

-- 2. Backfill existing counts (Cumulative logic)
UPDATE public.jobs
SET 
  applicant_count = COALESCE((SELECT COUNT(*) FROM public.applications WHERE applications.job_pk = jobs.id), 0),
  selected_count = COALESCE((SELECT COUNT(*) FROM public.applications WHERE applications.job_pk = jobs.id AND applications.status_id IN (3, 4, 5, 6, 7, 8, 9, 10, 11)), 0),
  referred_count = COALESCE((SELECT COUNT(*) FROM public.applications WHERE applications.job_pk = jobs.id AND applications.status_id IN (5, 6, 7, 8, 9, 10, 11)), 0),
  hired_count = COALESCE((SELECT COUNT(*) FROM public.applications WHERE applications.job_pk = jobs.id AND applications.status_id IN (9, 10)), 0);

-- 3. Create or replace trigger function
CREATE OR REPLACE FUNCTION update_job_application_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment total applicant count
    UPDATE public.jobs 
    SET applicant_count = applicant_count + 1 
    WHERE id = NEW.job_pk;

    -- Increment specific counts if status dictates (cumulative)
    IF NEW.status_id IN (3, 4, 5, 6, 7, 8, 9, 10, 11) THEN
      UPDATE public.jobs SET selected_count = selected_count + 1 WHERE id = NEW.job_pk;
    END IF;
    IF NEW.status_id IN (5, 6, 7, 8, 9, 10, 11) THEN
      UPDATE public.jobs SET referred_count = referred_count + 1 WHERE id = NEW.job_pk;
    END IF;
    IF NEW.status_id IN (9, 10) THEN
      UPDATE public.jobs SET hired_count = hired_count + 1 WHERE id = NEW.job_pk;
    END IF;

    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status_id IS DISTINCT FROM NEW.status_id THEN
      -- Handle selected_count (cumulative)
      -- Includes status 3 (Selected), 4 (Unlocked), 5 (Referred), etc.
      IF OLD.status_id IN (3, 4, 5, 6, 7, 8, 9, 10, 11) AND NEW.status_id NOT IN (3, 4, 5, 6, 7, 8, 9, 10, 11) THEN
        UPDATE public.jobs SET selected_count = selected_count - 1 WHERE id = NEW.job_pk;
      ELSIF OLD.status_id NOT IN (3, 4, 5, 6, 7, 8, 9, 10, 11) AND NEW.status_id IN (3, 4, 5, 6, 7, 8, 9, 10, 11) THEN
        UPDATE public.jobs SET selected_count = selected_count + 1 WHERE id = NEW.job_pk;
      END IF;

      -- Handle referred_count (cumulative)
      -- Includes status 5 (Referred), 6 (Interviewing), etc.
      IF OLD.status_id IN (5, 6, 7, 8, 9, 10, 11) AND NEW.status_id NOT IN (5, 6, 7, 8, 9, 10, 11) THEN
        UPDATE public.jobs SET referred_count = referred_count - 1 WHERE id = NEW.job_pk;
      ELSIF OLD.status_id NOT IN (5, 6, 7, 8, 9, 10, 11) AND NEW.status_id IN (5, 6, 7, 8, 9, 10, 11) THEN
        UPDATE public.jobs SET referred_count = referred_count + 1 WHERE id = NEW.job_pk;
      END IF;

      -- Handle hired_count (cumulative)
      -- Includes status 9 (Joined), 10 (Completed)
      IF OLD.status_id IN (9, 10) AND NEW.status_id NOT IN (9, 10) THEN
        UPDATE public.jobs SET hired_count = hired_count - 1 WHERE id = NEW.job_pk;
      ELSIF OLD.status_id NOT IN (9, 10) AND NEW.status_id IN (9, 10) THEN
        UPDATE public.jobs SET hired_count = hired_count + 1 WHERE id = NEW.job_pk;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.jobs 
    SET applicant_count = applicant_count - 1 
    WHERE id = OLD.job_pk;

    IF OLD.status_id IN (3, 4, 5, 6, 7, 8, 9, 10, 11) THEN
      UPDATE public.jobs SET selected_count = selected_count - 1 WHERE id = OLD.job_pk;
    END IF;
    IF OLD.status_id IN (5, 6, 7, 8, 9, 10, 11) THEN
      UPDATE public.jobs SET referred_count = referred_count - 1 WHERE id = OLD.job_pk;
    END IF;
    IF OLD.status_id IN (9, 10) THEN
      UPDATE public.jobs SET hired_count = hired_count - 1 WHERE id = OLD.job_pk;
    END IF;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger
DROP TRIGGER IF EXISTS trigger_update_job_application_counts ON public.applications;
CREATE TRIGGER trigger_update_job_application_counts
AFTER INSERT OR UPDATE OR DELETE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION update_job_application_counts();

-- 5. Clear Supabase Schema Cache
NOTIFY pgrst, 'reload schema';
