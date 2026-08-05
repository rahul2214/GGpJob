-- Add Response Time and Feedback Columns to the applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS response_time_seconds integer;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS jobseeker_feedback jsonb;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS feedback_submitted_at timestamptz;

-- Ensure status 13 is added to application_statuses
INSERT INTO application_statuses (id, name)
VALUES (13, 'Verified Referral')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
