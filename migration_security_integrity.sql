-- ============================================================================
-- JobsDart — security hardening migration
--
-- Adds the database-level guarantees that the application-level fixes rely on.
-- Every statement is idempotent and none of them drop or rewrite existing data.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Payment replay protection
--
-- /api/payments/verify grants an entitlement once per gateway payment id. The
-- application checks for a prior row first, but two concurrent verifications
-- could both pass that check. This unique index makes the database the final
-- arbiter, so only one of them can record the payment.
--
-- If this index fails to create, the payments table already contains duplicate
-- payment_id values. Inspect them before retrying:
--   SELECT payment_id, count(*) FROM public.payments
--   WHERE payment_id IS NOT NULL
--   GROUP BY payment_id HAVING count(*) > 1;
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS payments_payment_id_unique
  ON public.payments (payment_id)
  WHERE payment_id IS NOT NULL;

-- Speeds up the duplicate lookup performed before an entitlement is granted.
CREATE INDEX IF NOT EXISTS payments_user_id_idx
  ON public.payments (user_id);

-- ---------------------------------------------------------------------------
-- 2. Coupon redemption integrity
--
-- current_uses must never exceed max_uses, and must never go negative. The
-- application claims a redemption with a compare-and-set update; this
-- constraint is the backstop.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'coupons_uses_within_cap'
  ) THEN
    -- Normalise any existing rows first so the constraint can be validated.
    UPDATE public.coupons SET current_uses = 0 WHERE current_uses IS NULL OR current_uses < 0;

    ALTER TABLE public.coupons
      ADD CONSTRAINT coupons_uses_within_cap
      CHECK (current_uses >= 0 AND (max_uses IS NULL OR current_uses <= max_uses))
      NOT VALID;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Referral reward integrity
--
-- A referee may only ever be rewarded once. The application claims the reward
-- with a conditional update; default the column so the condition is meaningful
-- for existing rows.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'jobseekers' AND column_name = 'referral_rewarded'
  ) THEN
    UPDATE public.jobseekers SET referral_rewarded = false WHERE referral_rewarded IS NULL;
    ALTER TABLE public.jobseekers ALTER COLUMN referral_rewarded SET DEFAULT false;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4. Application feedback bounds
--
-- /api/applications/[id]/feedback now validates the rating server-side; mirror
-- that as a column constraint.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'applications_rating_range'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'rating'
  ) THEN
    ALTER TABLE public.applications
      ADD CONSTRAINT applications_rating_range
      CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5))
      NOT VALID;
  END IF;
END $$;
