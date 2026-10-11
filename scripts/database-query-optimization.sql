-- ==============================================================================================
-- DATABASE QUERY PERFORMANCE OPTIMIZATION SCRIPT
-- Tailored directly to your Supabase pg_stat_statements query performance analysis
-- ==============================================================================================

-- ----------------------------------------------------------------------------------------------
-- STEP 1: FIX THE #1 BOTTLENECK (63.7% DB LOAD): TAME SUPABASE REALTIME WAL REPLICATION
-- ----------------------------------------------------------------------------------------------
-- PostgreSQL syntax does not support "DROP TABLE IF EXISTS" inside ALTER PUBLICATION.
-- This block dynamically inspects pg_publication_tables and safely removes only non-realtime tables.
DO $$
DECLARE
    r RECORD;
    is_all_tables BOOLEAN := false;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        SELECT puballtables INTO is_all_tables 
        FROM pg_publication 
        WHERE pubname = 'supabase_realtime';

        IF is_all_tables THEN
            -- If publication was created with FOR ALL TABLES, recreate cleanly for essential tables only:
            DROP PUBLICATION supabase_realtime;
            CREATE PUBLICATION supabase_realtime;
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
                ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
                ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
            END IF;
        ELSE
            -- Dynamically drop each table that is currently published in supabase_realtime (except notifications and messages)
            FOR r IN (
                SELECT tablename 
                FROM pg_publication_tables 
                WHERE pubname = 'supabase_realtime' 
                  AND tablename NOT IN ('notifications', 'messages')
            ) LOOP
                EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', r.tablename);
            END LOOP;
        END IF;
    END IF;
END $$;

-- ----------------------------------------------------------------------------------------------
-- STEP 2: ACCELERATE THE 'jobs' FEED & LATERAL JOIN SUBQUERIES
-- ----------------------------------------------------------------------------------------------

-- Primary Feed Index: (status, expires_at, posted_at DESC)
CREATE INDEX IF NOT EXISTS idx_jobs_status_expires_posted 
  ON public.jobs (status, expires_at, posted_at DESC);

-- Compact index for active public feed
CREATE INDEX IF NOT EXISTS idx_jobs_active_feed 
  ON public.jobs (posted_at DESC) 
  WHERE status = 'active';

-- Instant UUID lookup (jobs.uuid = $7 which had 6,916 calls)
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_uuid 
  ON public.jobs (uuid);

-- Foreign keys on jobs for instantaneous LATERAL joins:
CREATE INDEX IF NOT EXISTS idx_jobs_job_type_pk 
  ON public.jobs (job_type_pk);

CREATE INDEX IF NOT EXISTS idx_jobs_workplace_type_pk 
  ON public.jobs (workplace_type_pk);

CREATE INDEX IF NOT EXISTS idx_jobs_company_size_id 
  ON public.jobs (company_size_id);

CREATE INDEX IF NOT EXISTS idx_jobs_currency_id 
  ON public.jobs (currency_id);

CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_pk 
  ON public.jobs (recruiter_pk);

-- ----------------------------------------------------------------------------------------------
-- STEP 3: ACCELERATE applications_count:applications(count) LATERAL SUBQUERY
-- ----------------------------------------------------------------------------------------------
-- Speeds up count of applications per job
CREATE INDEX IF NOT EXISTS idx_applications_job_pk 
  ON public.applications (job_pk);

-- Speeds up applicant lookup & prevents duplicate applications under concurrency
CREATE INDEX IF NOT EXISTS idx_applications_job_user 
  ON public.applications (job_pk, user_pk);

CREATE INDEX IF NOT EXISTS idx_applications_user_pk 
  ON public.applications (user_pk);

-- ----------------------------------------------------------------------------------------------
-- STEP 4: OPTIMIZE USER PROFILE & CREDIT RESET LOOKUPS
-- ----------------------------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobseekers_uuid 
  ON public.jobseekers (uuid);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobseekers' AND column_name = 'next_credit_reset_at'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_jobseekers_credit_reset 
      ON public.jobseekers (uuid, next_credit_reset_at);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_recruiters_uuid 
  ON public.recruiters (uuid);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_uuid 
  ON public.admins (uuid);

-- ----------------------------------------------------------------------------------------------
-- STEP 5: ACCELERATE LOCATION, SKILL & BENEFIT JUNCTIONS
-- ----------------------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_job_locations_job_id 
  ON public.job_locations (job_id);

CREATE INDEX IF NOT EXISTS idx_job_skills_job_pk 
  ON public.job_skills (job_pk, skill_pk);

CREATE INDEX IF NOT EXISTS idx_job_benefits_job_pk 
  ON public.job_benefits (job_pk, benefit_pk);

-- ----------------------------------------------------------------------------------------------
-- STEP 6: UPDATE QUERY PLANNER STATISTICS (ANALYZE)
-- ----------------------------------------------------------------------------------------------
ANALYZE public.jobs;
ANALYZE public.applications;
ANALYZE public.jobseekers;
ANALYZE public.recruiters;
ANALYZE public.job_locations;
ANALYZE public.job_skills;
ANALYZE public.job_benefits;

-- ----------------------------------------------------------------------------------------------
-- STEP 7: RESET STATS TO MEASURE CLEAN POST-OPTIMIZATION METRICS
-- ----------------------------------------------------------------------------------------------
SELECT pg_stat_statements_reset();
