const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function runMigration() {
    const env = fs.readFileSync('.env', 'utf8');
    const getVar = (name) => {
        const match = env.match(new RegExp(`${name}=(.*)`));
        return match ? match[1].trim() : null;
    };

    const supabaseUrl = getVar('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseKey = getVar('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing env vars');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const sql = fs.readFileSync('supabase/create_chat_tables.sql', 'utf8');

    const { data, error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
    console.log('Migration successful:', data);
}

runMigration();
