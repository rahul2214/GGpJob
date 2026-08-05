-- Create jobseeker_personal_details table
CREATE TABLE IF NOT EXISTS public.jobseeker_personal_details (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_pk BIGINT NOT NULL UNIQUE REFERENCES public.jobseekers(id) ON DELETE CASCADE,
    gender TEXT,
    marital_status TEXT,
    date_of_birth DATE,
    category TEXT,
    disability_status TEXT,
    military_experience TEXT,
    career_break TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.jobseeker_personal_details ENABLE ROW LEVEL SECURITY;

-- Policies (assuming public for now as per other tables in this project)
CREATE POLICY "Enable all for all users" ON public.jobseeker_personal_details FOR ALL USING (true) WITH CHECK (true);

-- Migrate existing data from jobseekers table if columns exist
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobseekers' AND column_name='gender') THEN
        INSERT INTO public.jobseeker_personal_details (
            user_pk, gender, marital_status, date_of_birth, category, 
            disability_status, military_experience, career_break
        )
        SELECT 
            id, gender, marital_status, date_of_birth, category, 
            disability_status, military_experience, career_break
        FROM public.jobseekers
        ON CONFLICT (user_pk) DO UPDATE SET
            gender = EXCLUDED.gender,
            marital_status = EXCLUDED.marital_status,
            date_of_birth = EXCLUDED.date_of_birth,
            category = EXCLUDED.category,
            disability_status = EXCLUDED.disability_status,
            military_experience = EXCLUDED.military_experience,
            career_break = EXCLUDED.career_break;
    END IF;
END $$;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jobseeker_personal_details_updated_at
    BEFORE UPDATE ON public.jobseeker_personal_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
