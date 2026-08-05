-- ====================================================================
-- JobsDart: Dynamic Plan Prices Table
-- ====================================================================

-- 1. Create plan_prices table
CREATE TABLE IF NOT EXISTS public.plan_prices (
    plan_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) DEFAULT 'Plan',
    base_price NUMERIC NOT NULL,
    base_currency VARCHAR(10) DEFAULT 'USD',
    credits INTEGER DEFAULT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Populate plan_prices with initial USD default prices
INSERT INTO public.plan_prices (plan_id, name, base_price, base_currency, credits) VALUES
('basic', 'Basic Plan', 19.00, 'USD', NULL),
('premium', 'Premium Plan', 49.00, 'USD', NULL),
('pro', 'Pro Recruitment', 99.00, 'USD', NULL),
('talent', 'Talent Search', 29.00, 'USD', NULL),
('free', 'Free Plan', 0.00, 'USD', NULL),
('jobseeker_premium', 'Premium Plan', 9.00, 'USD', NULL),
('jobseeker_pro', 'Pro Plan', 19.00, 'USD', NULL),
('mini', 'Mini Pack', 3.00, 'USD', 10),
('popular_pack', 'Popular Pack', 9.00, 'USD', 60),
('pro_pack', 'Pro Pack', 19.00, 'USD', 150),
('employee_starter', 'Starter Boost', 5.00, 'USD', 50),
('employee_double', 'Double Boost', 9.00, 'USD', 100),
('employee_pro', 'Pro Boost Pack', 19.00, 'USD', 250),
('employee_enterprise', 'Enterprise Boost', 39.00, 'USD', 600)
ON CONFLICT (plan_id) DO UPDATE 
SET base_price = EXCLUDED.base_price, name = EXCLUDED.name, credits = EXCLUDED.credits, updated_at = NOW();
