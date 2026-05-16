const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
    console.log('Testing payouts fetch...');
    const { data, error } = await supabase.from('payouts').select('*').limit(5);
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success! Payouts sample:', data);
    }
}

test();
