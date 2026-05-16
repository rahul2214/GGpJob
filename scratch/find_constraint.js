const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkConstraint() {
    const { data, error } = await supabase.rpc('get_table_constraints', { t_name: 'applications' });
    if (error) {
        // If RPC doesn't exist, try a direct query to information_schema
        console.log("RPC failed, trying direct query...");
        const { data: data2, error: error2 } = await supabase.from('_information_schema_check_constraints').select('*').limit(10);
        // Supabase doesn't allow direct access to information_schema via API usually
        console.log("Direct query also likely failed if you see this.");
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}

async function runRawQuery() {
    // We can't run raw SQL via the standard supabase-js client unless we have an RPC
    // But I can try to find an existing migration file that might have it
    console.log("Searching for migration files...");
}

checkConstraint();
