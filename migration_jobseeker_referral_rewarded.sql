-- SQL Migration: Add referral_rewarded and referral_rewarded_at columns to public.jobseekers table
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

ALTER TABLE public.jobseekers 
ADD COLUMN IF NOT EXISTS referral_rewarded boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS referral_rewarded_at timestamp with time zone NULL;

-- Backfill existing data from metadata JSONB
UPDATE public.jobseekers
SET 
  referral_rewarded = COALESCE((metadata->>'referral_rewarded')::boolean, (metadata->>'referralRewarded')::boolean, referral_rewarded, false),
  referral_rewarded_at = COALESCE((metadata->>'referral_rewarded_at')::timestamp with time zone, (metadata->>'referralRewardedAt')::timestamp with time zone, referral_rewarded_at);
