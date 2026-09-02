-- SQL Migration: Add dedicated columns for ATS, Referral, and Resume Builder flags to public.jobseekers table
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

ALTER TABLE public.jobseekers 
ADD COLUMN IF NOT EXISTS has_used_ats_checker boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS has_seen_referral_prompt boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS referral_step_dismissed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS has_used_resume_builder boolean NOT NULL DEFAULT false;

-- Backfill existing values from metadata JSONB column if present
UPDATE public.jobseekers
SET 
  has_used_ats_checker = COALESCE((metadata->>'has_used_ats_checker')::boolean, (metadata->>'hasUsedAtsChecker')::boolean, has_used_ats_checker, false),
  has_seen_referral_prompt = COALESCE((metadata->>'hasSeenReferralPrompt')::boolean, (metadata->>'has_seen_referral_prompt')::boolean, has_seen_referral_prompt, false),
  referral_step_dismissed = COALESCE((metadata->>'referralStepDismissed')::boolean, (metadata->>'referral_step_dismissed')::boolean, referral_step_dismissed, false),
  has_used_resume_builder = COALESCE((metadata->>'has_used_resume_builder')::boolean, (metadata->>'hasUsedResumeBuilder')::boolean, has_used_resume_builder, false);
