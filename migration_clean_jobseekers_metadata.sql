-- SQL Migration: Remove migrated keys and UI flags from public.jobseekers metadata JSONB
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Ensure all dedicated columns exist before clearing metadata
ALTER TABLE public.jobseekers 
ADD COLUMN IF NOT EXISTS has_used_ats_checker boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS has_seen_referral_prompt boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS referral_step_dismissed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS has_used_resume_builder boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS referral_rewarded boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS referral_rewarded_at timestamp with time zone NULL;

-- 2. Backfill dedicated columns from metadata if not already set
UPDATE public.jobseekers
SET 
  has_used_ats_checker = COALESCE(has_used_ats_checker, (metadata->>'has_used_ats_checker')::boolean, (metadata->>'hasUsedAtsChecker')::boolean, false),
  has_seen_referral_prompt = COALESCE(has_seen_referral_prompt, (metadata->>'hasSeenReferralPrompt')::boolean, (metadata->>'has_seen_referral_prompt')::boolean, false),
  referral_step_dismissed = COALESCE(referral_step_dismissed, (metadata->>'referralStepDismissed')::boolean, (metadata->>'referral_step_dismissed')::boolean, false),
  has_used_resume_builder = COALESCE(has_used_resume_builder, (metadata->>'has_used_resume_builder')::boolean, (metadata->>'hasUsedResumeBuilder')::boolean, false),
  referral_rewarded = COALESCE(referral_rewarded, (metadata->>'referral_rewarded')::boolean, (metadata->>'referralRewarded')::boolean, false),
  referral_rewarded_at = COALESCE(referral_rewarded_at, (metadata->>'referral_rewarded_at')::timestamp with time zone, (metadata->>'referralRewardedAt')::timestamp with time zone);

-- 3. Strip all migrated keys, Firebase sync metadata, and UI flags from metadata JSONB
UPDATE public.jobseekers
SET metadata = metadata 
  - 'referral_rewarded'
  - 'referralRewarded'
  - 'referral_rewarded_at'
  - 'referralRewardedAt'
  - 'workplaceTypeId'
  - 'workplace_type_id'
  - 'workplaceType'
  - 'workplace_type'
  - 'noticePeriodId'
  - 'notice_period_id'
  - 'noticePeriod'
  - 'notice_period'
  - 'has_used_ats_checker'
  - 'hasUsedAtsChecker'
  - 'hasSeenReferralPrompt'
  - 'has_seen_referral_prompt'
  - 'referralStepDismissed'
  - 'referral_step_dismissed'
  - 'has_used_resume_builder'
  - 'hasUsedResumeBuilder'
  - 'firebase_uid'
  - 'firebaseUid'
  - 'synced_from_firebase'
  - 'syncedFromFirebase'
  - 'firebase_creation_time'
  - 'firebaseCreationTime'
  - 'country'
  - 'state'
  - 'currentCity'
  - 'current_city'
  - 'countryId'
  - 'stateId'
  - 'cityId'
  - 'visaRequirement'
  - 'visaRequirementId'
  - 'preferredJobTitles'
  - 'preferred_job_titles'
  - 'preferredSalaryMin'
  - 'preferred_salary_min'
  - 'preferredSalaryMax'
  - 'preferred_salary_max'
  - 'preferredCurrency'
  - 'preferred_currency'
  - 'remotePreference'
  - 'remote_preference'
  - 'employmentTypes'
  - 'employment_types'
  - 'preferredIndustries'
  - 'preferred_industries'
  - 'workAuthorization'
  - 'work_authorization'
  - 'preferredLanguages'
  - 'preferred_languages'
  - 'preferredLocations'
  - 'preferred_locations'
  - 'gender'
  - 'maritalStatus'
  - 'dateOfBirth'
  - 'category'
  - 'disabilityStatus'
  - 'militaryExperience'
  - 'careerBreak'
  - 'headline'
  - 'summary'
  - 'annualSalary'
  - 'expectedSalary'
  - 'salaryBreakdown'
  - 'name'
  - 'email'
  - 'phone'
  - 'skills'
  - 'experience'
  - 'education'
  - 'projects'
  - 'languages'
WHERE metadata IS NOT NULL AND metadata != '{}'::jsonb;
