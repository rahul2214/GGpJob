-- Create Wallet Transactions Table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_pk UUID NOT NULL REFERENCES employees(uuid) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    method TEXT NOT NULL, -- 'bank', 'upi', 'amazon'
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Index for performance
CREATE INDEX IF NOT EXISTS idx_wallet_user ON wallet_transactions(user_pk);

-- Grant permissions (if needed)
-- ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
