-- SQL Migration: Add workplace_type_id foreign key to jobseekers table
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

ALTER TABLE public.jobseekers 
ADD COLUMN IF NOT EXISTS workplace_type_id bigint REFERENCES public.workplace_types(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_jobseekers_workplace_type_id 
ON public.jobseekers USING btree (workplace_type_id) TABLESPACE pg_default;
