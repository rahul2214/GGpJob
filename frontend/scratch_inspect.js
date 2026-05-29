const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAllTables() {
    console.log('Listing all tables...');
    const { data, error } = await supabase.rpc('get_table_names'); // or query information_schema if rpc not available
    if (error) {
        // query using rest api on a known table or let's try raw pg query if we can or information schema via postgrest if exposed
        // wait, postgrest doesn't expose information_schema by default. Let's check if there's a table list
    }
}

async function testKnownTables() {
    const candidateTables = ['transactions', 'earnings', 'wallet_history', 'rewards_history', 'referral_payouts', 'ledgers', 'wallet_transactions', 'referrals', 'milestone_rewards'];
    console.log('Checking candidate tables...');
    for (const t of candidateTables) {
        const { error } = await supabase.from(t).select('id').limit(1);
        if (!error || error.code !== '42P01') { // 42P01 is relation does not exist
            console.log(`Table exists: ${t}`, error ? `(Error: ${error.message})` : '');
        }
    }
}

testKnownTables();
