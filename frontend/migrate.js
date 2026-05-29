const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

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
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
        if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
    }
    
    const supabase = createClient(url, key);

    // SQL to run
    const sql = `
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS response_time_seconds integer;
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS jobseeker_feedback jsonb;
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS feedback_submitted_at timestamptz;

    INSERT INTO application_statuses (id, name) 
    VALUES (13, 'Verified Referral') 
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
    `;

    console.log("Attempting migration via exec_sql RPC...");
    const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', { sql });
    if (rpcError) {
        console.error("RPC exec_sql failed:", rpcError);
    } else {
        console.log("Migration executed successfully via RPC. Data:", rpcData);
    }
}

migrate();
