require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const tables = ['jobseekers', 'employees', 'recruiters', 'admins'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('referral_code').limit(1);
    if (error) {
      console.log(`Table ${table}: does NOT have referral_code (${error.message})`);
    } else {
      console.log(`Table ${table}: HAS referral_code`);
    }
  }
}

run();
