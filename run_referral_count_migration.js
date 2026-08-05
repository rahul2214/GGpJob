const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function migrate() {
    let envFile = '';
    try {
        envFile = fs.readFileSync('.env.local', 'utf8');
    } catch(e) {
        envFile = fs.readFileSync('.env', 'utf8');
    }
    
    const lines = envFile.split('\n');
    let url, key;
    for (const line of lines) {
        if (line.trim().startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
        if (line.trim().startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
    }
    
    if (!url || !key) {
        console.error("Could not find SUPABASE URL or service role key in env files.");
        return;
    }
    
    const supabase = createClient(url, key);

    const sql = `
    ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

    -- Backfill referral counts for existing accounts
    UPDATE public.jobseekers js
    SET referral_count = (
        SELECT COUNT(*)
        FROM public.jobseekers referred
        WHERE referred.referred_by = js.uuid
    );

    NOTIFY pgrst, 'reload schema';
    `;

    console.log("Attempting migration to add referral_count via exec_sql RPC...");
    const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', { sql_string: sql });
    if (rpcError) {
        console.error("RPC exec_sql failed:", rpcError);
    } else {
        console.log("Migration executed successfully via RPC. Data:", rpcData);
    }
}

migrate().catch(console.error);
